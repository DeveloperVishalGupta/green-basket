import { Alert, Spin } from 'antd';

/**
 * Reusable loading component for admin pages
 */
export const AdminLoadingState = ({ height = 'h-96' }) => {
  return (
    <div className={`flex items-center justify-center ${height}`}>
      <Spin size="large" />
    </div>
  );
};

/**
 * Reusable error component for admin pages with retry functionality
 */
export const AdminErrorState = ({
  title = "Failed to Load Data",
  description,
  onRetry,
  retryText = "Retry"
}) => {
  return (
    <div className="p-6">
      <Alert
        title={title}
        description={description || "Unable to fetch data. Please try again."}
        type="error"
        showIcon
        action={
          onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              {retryText}
            </button>
          )
        }
      />
    </div>
  );
};