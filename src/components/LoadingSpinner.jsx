export default function LoadingSpinner({ size = "lg", text = "Loading..." }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4`}></div>
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  );
}
