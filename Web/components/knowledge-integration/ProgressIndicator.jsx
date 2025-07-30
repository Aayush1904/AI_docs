"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

const ProgressIndicator = ({ connectedCount, totalCount, isProcessing, connectingSource }) => {
  const progress = (connectedCount / totalCount) * 100;
  const availableCount = totalCount - 2; // Exclude coming soon items

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Integration Progress
              </h3>
              <p className="text-sm text-gray-600">
                {connectedCount} of {availableCount} sources connected
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isProcessing ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">
                    {connectingSource 
                      ? `Connecting to ${connectingSource}...` 
                      : "Processing..."
                    }
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {connectedCount === availableCount ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {connectedCount === availableCount ? "Complete" : "In Progress"}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {connectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Ready for unified search</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgressIndicator; 