import { format } from "date-fns";

type VersionStatusProps = {
  currentVersion: number;
  lastSaved: Date;
  isDirty: boolean;
  hasError: boolean;
  isInitialEditing: boolean;
  errorMessage?: string;
};

export default function VersionStatus({
  currentVersion,
  lastSaved,
  isDirty,
  hasError,
  isInitialEditing,
  errorMessage,
}: VersionStatusProps) {
  if (!isInitialEditing) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          Version {currentVersion}
        </span>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        {isDirty ? (
          <span className="text-gray-500 dark:text-gray-400">Saving...</span>
        ) : hasError ? (
          <span className="text-red-500 dark:text-red-400">{errorMessage}</span>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">
            Last saved: {format(lastSaved, "h:mm:ss a")}
          </span>
        )}
      </div>
    );
  }

  return null;
}
