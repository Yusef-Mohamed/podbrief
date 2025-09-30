import React from "react";
import MainLayout from "./layout/MainLayout";
import LatestEpisodesSpread from "./home/LatestEpisodesSpread";
import Top5PicksSpread from "./home/Top5PicksSpread";

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="flex gap-8">
        <div className="flex-1">
          <LatestEpisodesSpread />
        </div>

        <div className="space-y-4 w-64 ">
          <h3 className="text-xl font-bold">Top 5 Picks</h3>
          <Top5PicksSpread
            selectedCategory="all"
            showPagination={false}
            pageSize={5}
            title=""
            gridClassName="grid-cols-1"
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
