"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Globe, 
  Lock, 
  Shield, 
  Eye,
  Users,
  UserCheck
} from "lucide-react";

const ACCESS_LEVELS = {
  public: {
    label: "Public",
    description: "Anyone can access",
    icon: Globe,
    color: "bg-green-100 text-green-800 border-green-200",
    bgColor: "bg-green-50"
  },
  private: {
    label: "Private",
    description: "Only you can access",
    icon: Lock,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    bgColor: "bg-gray-50"
  },
  restricted: {
    label: "Restricted",
    description: "Specific users only",
    icon: Users,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    bgColor: "bg-yellow-50"
  },
  confidential: {
    label: "Confidential",
    description: "Highest security level",
    icon: Shield,
    color: "bg-red-100 text-red-800 border-red-200",
    bgColor: "bg-red-50"
  }
};

export default function AccessLevelSelector({ 
  value, 
  onChange, 
  disabled = false,
  showDescription = true,
  size = "default"
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLevel = ACCESS_LEVELS[value] || ACCESS_LEVELS.public;
  const IconComponent = currentLevel.icon;

  const handleSelect = (level) => {
    onChange(level);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`flex items-center gap-2 ${currentLevel.bgColor} ${currentLevel.color} border-2 hover:${currentLevel.bgColor} ${
            size === "sm" ? "h-8 px-2 text-sm" : "h-10 px-3"
          }`}
        >
          <IconComponent className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`} />
          <span className="font-medium">{currentLevel.label}</span>
          {showDescription && size !== "sm" && (
            <span className="text-xs opacity-75">({currentLevel.description})</span>
          )}
          <ChevronDown className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"} opacity-50`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {Object.entries(ACCESS_LEVELS).map(([level, config]) => {
          const LevelIcon = config.icon;
          return (
            <DropdownMenuItem
              key={level}
              onClick={() => handleSelect(level)}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:${config.bgColor} ${
                value === level ? config.color : ""
              }`}
            >
              <LevelIcon className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{config.label}</span>
                <span className="text-xs opacity-75">{config.description}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Static badge component for displaying access level
export function AccessLevelBadge({ level, size = "default" }) {
  const config = ACCESS_LEVELS[level] || ACCESS_LEVELS.public;
  const IconComponent = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 ${config.color} ${
        size === "sm" ? "text-xs px-2 py-1" : "px-3 py-1"
      }`}
    >
      <IconComponent className={`${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`} />
      <span className="font-medium">{config.label}</span>
    </Badge>
  );
} 