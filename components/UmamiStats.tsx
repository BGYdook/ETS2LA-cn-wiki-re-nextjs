"use client";

import { useEffect, useState } from "react";
// 添加suppressHydrationWarning属性
import { Suspense } from "react";

interface ShareResponse {
  token: string;
  websiteId: string;
}

interface StatsResponse {
  pageviews: {
    value: number;
  };
  visits: {
    value: number;
  };
  visitors: {
    value: number;
  };
}

export default function UmamiStats() {
  const [pageviews, setPageviews] = useState<number | null>(null);
  const [visits, setVisits] = useState<number | null>(null);
  const [visitors, setVisitors] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 定义标签文本
  const visitsLabel = "访问次数";
  const viewsLabel = "　浏览量";  // 添加全角空格使"浏"字与"统"字对齐
  const visitorsLabel = "　访客";  // 添加全角空格保持对齐

  // Umami API信息
  const apiUrl = "https://static.ets2la.cn";
  const shareId = "3X23lyKTw4dYOm54";

  useEffect(() => {
    async function fetchStats() {
      try {
        if (!apiUrl || !shareId) {
          setLoading(false);
          return;
        }
        
        console.log("开始获取Umami统计数据");
        
        // 1. 获取token和websiteId
        const shareUrl = `${apiUrl}/api/share/${shareId}`;
        console.log("请求分享API:", shareUrl);
        
        const shareRes = await fetch(shareUrl, { 
          cache: "no-store",
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!shareRes.ok) {
          console.error("获取分享信息失败:", shareRes.status, shareRes.statusText);
          setLoading(false);
          return;
        }
        
        const shareData: ShareResponse = await shareRes.json();
        console.log("获取到的分享信息:", shareData);
        
        const { token, websiteId } = shareData;
        
        if (!token || !websiteId) {
          console.error("未获取到有效的token或websiteId");
          setLoading(false);
          return;
        }
        
        // 2. 构建统计数据请求URL
        const startAt = '1733333200000'; // 固定的起始时间
        const endAt = Date.now().toString(); // 当前时间戳
        const unit = 'hour';
        const timezone = 'Asia/Shanghai';
        const url = '/'; // 首页路径
        const compare = 'false';
        
        // 3. 发送统计请求
        const statsUrl = `${apiUrl}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}&unit=${unit}&timezone=${timezone}&url=${url}&compare=${compare}`;
        console.log("请求统计数据:", statsUrl);
        
        const statsRes = await fetch(statsUrl, {
          cache: "no-store",
          headers: {
            'Accept': 'application/json',
            'x-umami-share-token': token
          }
        });
        
        if (!statsRes.ok) {
          console.error("获取统计数据失败:", statsRes.status, statsRes.statusText);
          setLoading(false);
          return;
        }
        
        // 4. 处理响应数据
        const statsData: StatsResponse = await statsRes.json();
        console.log("获取到的统计数据:", statsData);
        
        if (statsData.pageviews && statsData.visits) {
          setPageviews(statsData.pageviews.value);
          setVisits(statsData.visits.value);
          
          // 处理visitors数据
          if (statsData.visitors) {
            setVisitors(statsData.visitors.value);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("获取Umami统计数据失败:", error);
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [apiUrl, shareId]);

  return (
    <div className="text-sm text-muted-foreground">
      <div className="flex items-center gap-4" suppressHydrationWarning>
        <span id="umami-pageviews" suppressHydrationWarning>{viewsLabel}：{loading ? "加载中..." : (pageviews !== null ? pageviews : "-")}</span>
        <span id="umami-visits" suppressHydrationWarning>{visitsLabel}：{loading ? "加载中..." : (visits !== null ? visits : "-")}</span>
        <span id="umami-visitors" suppressHydrationWarning>{visitorsLabel}：{loading ? "加载中..." : (visitors !== null ? visitors : "-")}</span>
      </div>
    </div>
  );
}