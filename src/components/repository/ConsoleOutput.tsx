import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal } from "lucide-react";
import { ConsoleLog } from "@/types/repository";

interface ConsoleOutputProps {
  showConsole: boolean;
  onToggleConsole: () => void;
  logs: ConsoleLog[];
}

export function ConsoleOutput({ showConsole, onToggleConsole, logs }: ConsoleOutputProps) {
  return (
    <div className="pt-4 border-t border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Console Output
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleConsole}
        >
          {showConsole ? 'Hide Console' : 'Show Console'}
        </Button>
      </div>
      
      {showConsole && (
        <ScrollArea className="h-[300px] w-full rounded-md border bg-black/90 p-4 font-mono text-sm">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`mb-2 ${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'success' ? 'text-green-400' :
                'text-blue-400'
              }`}
            >
              <span className="text-gray-500">[{log.timestamp}]</span>{' '}
              {log.message}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500">No console output available</div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}