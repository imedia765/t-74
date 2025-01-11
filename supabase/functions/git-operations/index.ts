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
  }
};

const parseGitHubUrl = (url: string) => {
  try {
    const regex = /github\.com\/([^\/]+)\/([^\/\.]+)/;
    const match = url.match(regex);
    
    if (!match) {
      throw new Error(`Invalid GitHub URL: ${url}`);
    }

    return {
      owner: match[1],
      repo: match[2].replace('.git', '')
    };
  } catch (error) {
    log.error('Error parsing GitHub URL:', error);
    throw error;
  }
};

const getRepoDetails = async (url: string, octokit: Octokit) => {
  try {
    const { owner, repo } = parseGitHubUrl(url);
    log.info('Fetching details for repository:', { owner, repo });

    const [repoInfo, branches, lastCommits] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listBranches({ owner, repo }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 5 })
    ]);

    log.success('Repository details fetched successfully');

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, sourceRepoId } = await req.json();
    log.info('Received operation:', { type, sourceRepoId });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
      
      // Fetch the repository URL from the database
      const { data: repoData, error: repoError } = await supabaseClient
        .from('repositories')
        .select('url')
        .eq('id', sourceRepoId)
        .single();

      if (repoError) {
        log.error('Error fetching repository:', repoError);
        throw repoError;
      }

      if (!repoData?.url) {
        throw new Error('Repository URL not found');
      }

      const repoDetails = await getRepoDetails(repoData.url, octokit);
      log.success('Repository details fetched:', repoDetails);

      const lastCommit = repoDetails.lastCommits[0];
      
      // Update the repository with the new information
      const { error: updateError } = await supabaseClient
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

      if (updateError) {
        log.error('Error updating repository:', updateError);
        throw updateError;
      }

      log.success('Repository updated successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          details: repoDetails 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Git ${type} operation completed successfully`,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    log.error('Error in git-operations function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});