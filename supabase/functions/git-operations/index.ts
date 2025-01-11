import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Octokit } from 'https://esm.sh/octokit'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const log = {
  success: (message: string, data?: any) => {
    console.log('\x1b[32m%s\x1b[0m', '✓ SUCCESS:', message);
    if (data) console.log(JSON.stringify(data, null, 2));
  },
  error: (message: string, error?: any) => {
    console.error('\x1b[31m%s\x1b[0m', '✗ ERROR:', message);
    if (error) {
      console.error('\x1b[31m%s\x1b[0m', '  Details:');
      if (error.status) console.error('\x1b[31m%s\x1b[0m', `  Status: ${error.status}`);
      if (error.message) console.error('\x1b[31m%s\x1b[0m', `  Message: ${error.message}`);
      if (error.response?.data) {
        console.error('\x1b[31m%s\x1b[0m', '  Response Data:');
        console.error(JSON.stringify(error.response.data, null, 2));
      }
      if (error.stack) {
        console.error('\x1b[31m%s\x1b[0m', '  Stack Trace:');
        console.error(error.stack);
      }
    }
  },
  info: (message: string, data?: any) => {
    console.log('\x1b[36m%s\x1b[0m', 'ℹ INFO:', message);
    if (data) console.log(JSON.stringify(data, null, 2));
  },
  sql: (query: string, params?: any) => {
    console.log('\x1b[35m%s\x1b[0m', '🗄 SQL:', query);
    if (params) console.log('\x1b[35m%s\x1b[0m', '  Params:', JSON.stringify(params, null, 2));
  }
};

const getRepoDetails = async (owner: string, repo: string, octokit: Octokit) => {
  try {
    const [repoInfo, branches, lastCommits] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listBranches({ owner, repo }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 5 })
    ]);

    return {
      defaultBranch: repoInfo.data.default_branch,
      branches: branches.data.map(b => ({
        name: b.name,
        protected: b.protected,
        sha: b.commit.sha
      })),
      lastCommits: lastCommits.data.map(c => ({
        sha: c.sha,
        message: c.commit.message,
        date: c.commit.author?.date,
        author: c.commit.author?.name
      }))
    };
  } catch (error) {
    log.error('Error fetching repository details:', error);
    throw error;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, sourceRepoId, targetRepoId, pushType } = await req.json();
    log.info('Received operation:', { type, sourceRepoId, targetRepoId, pushType });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const githubToken = Deno.env.get('GITHUB_ACCESS_TOKEN');
    if (!githubToken) {
      log.error('GitHub token not found');
      throw new Error('GitHub token not configured');
    }

    const octokit = new Octokit({
      auth: githubToken
    });

    if (type === 'getLastCommit') {
      log.info('Getting repository details for:', sourceRepoId);
      
      const { repo, owner, repoName } = await getRepoDetails(sourceRepoId);
      log.success('Found repository:', repo.url);

      const repoDetails = await getRepoDetails(owner, repoName, octokit);
      
      const updateQuery = `
        UPDATE repositories 
        SET last_commit = $1, 
            last_commit_date = $2, 
            last_sync = $3, 
            status = $4,
            default_branch = $5,
            branches = $6,
            recent_commits = $7
        WHERE id = $8
      `;
      
      const lastCommit = repoDetails.lastCommits[0];
      
      log.sql(updateQuery, [
        lastCommit.sha,
        lastCommit.date,
        new Date().toISOString(),
        'synced',
        repoDetails.defaultBranch,
        JSON.stringify(repoDetails.branches),
        JSON.stringify(repoDetails.lastCommits),
        sourceRepoId
      ]);

      await supabaseClient
        .from('repositories')
        .update({ 
          last_commit: lastCommit.sha,
          last_commit_date: lastCommit.date,
          last_sync: new Date().toISOString(),
          status: 'synced',
          default_branch: repoDetails.defaultBranch,
          branches: repoDetails.branches,
          recent_commits: repoDetails.lastCommits
        })
        .eq('id', sourceRepoId);

      return new Response(
        JSON.stringify({ success: true, details: repoDetails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'push' && targetRepoId) {
      log.info('Starting push operation');
      
      const sourceDetails = await getRepoDetails(sourceRepoId);
      const targetDetails = await getRepoDetails(targetRepoId);

      log.info('Processing repositories:', {
        source: sourceDetails.repo.url,
        target: targetDetails.repo.url
      });

      const sourceDefaultBranch = await getDefaultBranch(sourceDetails.owner, sourceDetails.repoName);
      log.success('Source branch found:', sourceDefaultBranch);

      const targetDefaultBranch = await getDefaultBranch(targetDetails.owner, targetDetails.repoName);
      log.success('Target branch found:', targetDefaultBranch);

      const { data: sourceCommit } = await octokit.rest.repos.getCommit({
        owner: sourceDetails.owner,
        repo: sourceDetails.repoName,
        ref: sourceDefaultBranch
      });

      await ensureBranchExists(
        targetDetails.owner,
        targetDetails.repoName,
        targetDefaultBranch,
        sourceCommit.sha
      );

      try {
        if (pushType === 'force' || pushType === 'force-with-lease') {
          log.info('Performing force push...');
          await octokit.rest.git.updateRef({
            owner: targetDetails.owner,
            repo: targetDetails.repoName,
            ref: `heads/${targetDefaultBranch}`,
            sha: sourceCommit.sha,
            force: true
          });
          log.success('Force push completed');
        } else {
          log.info('Performing regular merge...');
          await octokit.rest.repos.merge({
            owner: targetDetails.owner,
            repo: targetDetails.repoName,
            base: targetDefaultBranch,
            head: sourceCommit.sha,
            commit_message: `Merge from ${sourceDetails.repo.nickname || sourceDetails.repo.url} using ${pushType} strategy`
          });
          log.success('Regular merge completed');
        }

        const timestamp = new Date().toISOString();
        await supabaseClient
          .from('repositories')
          .update({ 
            last_sync: timestamp,
            status: 'synced',
            last_commit: sourceCommit.sha,
            last_commit_date: timestamp
          })
          .in('id', [sourceRepoId, targetRepoId]);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Push operation completed successfully using ${pushType} strategy`,
            sha: sourceCommit.sha
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        log.error(`${pushType} operation failed:`, error);
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Git ${type} operation completed successfully`,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    log.error('Error in git-operations function:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      details: {
        status: error.status,
        name: error.name,
        message: error.message,
        response: error.response?.data,
        documentation_url: error.response?.data?.documentation_url,
        stack: error.stack
      }
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
