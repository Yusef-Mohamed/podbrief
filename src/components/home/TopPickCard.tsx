import React from "react";
import { Link } from "react-router-dom";

type TopPickCardProps = {
  title: string;
  subtitle: string;
  imageUrl?: string;
  href?: string;
  dateTimeText?: string;
};

const TopPickCard: React.FC<TopPickCardProps> = ({
  title,
  subtitle,
  imageUrl,
  href,
  dateTimeText,
}) => {
  return (
    <Link
      to={href || "#"}
      className="block rounded-xl overflow-hidden border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="h-36 w-full bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="pick"
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
      <div className="p-4">
        <div className="font-medium leading-tight line-clamp-2">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {subtitle}{" "}
          {dateTimeText ? (
            <span className="text-xs text-muted-foreground">
              {dateTimeText}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
};

export default TopPickCard;
