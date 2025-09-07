"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Settings,
  ExternalLink,
  Trash2
} from "lucide-react";

const IntegrationCard = ({ 
  source, 
  isConnected, 
  onConnect, 
  onDisconnect, 
  isConnecting,
  index 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = source.icon;

  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (source.status === "coming-soon") {
      return <Clock className="w-5 h-5 text-gray-400" />;
    }
    return <AlertCircle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusText = () => {
    if (isConnected) {
      return "Connected";
    }
    if (source.status === "coming-soon") {
      return "Coming Soon";
    }
    return "Not Connected";
  };

  const getStatusColor = () => {
    if (isConnected) {
      return "text-green-600";
    }
    if (source.status === "coming-soon") {
      return "text-gray-500";
    }
    return "text-gray-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 * index }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`h-full transition-all duration-300 ${
        isConnected 
          ? 'ring-2 ring-green-500 shadow-lg' 
          : isHovered 
            ? 'shadow-lg' 
            : 'shadow-sm'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`p-2 rounded-lg ${source.color}`}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <IconComponent className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-lg">{source.name}</CardTitle>
                {source.status === "coming-soon" && (
                  <Badge variant="secondary" className="mt-1">
                    Coming Soon
                  </Badge>
                )}
              </div>
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {getStatusIcon()}
            </motion.div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 min-h-[3rem]">
            {source.description}
          </CardDescription>
          
          <div className="flex items-center justify-between">
            <span className={`text-sm ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            
            {source.status !== "coming-soon" && (
              <div className="flex gap-2">
                {isConnected ? (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDisconnect(source.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Disconnect
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onConnect(source.id)}
                    disabled={isConnecting}
                    className={`${isConnecting ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isConnecting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Connecting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Connect
                      </div>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {isConnected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last synced: 2 minutes ago</span>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Data
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default IntegrationCard; 