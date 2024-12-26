import React from "react";
import { Loader } from "lucide-react";

/**
 * Loading componet displays a loading spinner anda message while content is being loaded.
 *
 * @param {Object} props - The props object.
 * @param {string} [props.message="Loading..."] - The message to display while loading.
 *
 * @returns {JSX.Element} The rendered Loading component.
 */
const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-4">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />

        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
