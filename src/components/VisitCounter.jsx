import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: ${({ theme }) => theme.text_secondary};
  font-size: 14px;
`;

const Dot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
`;

const Count = styled.span`
  color: ${({ theme }) => theme.text_primary};
  font-weight: 600;
`;

// Namespace/key for CountAPI. Change if you want to reset or isolate counts.
const NAMESPACE = "harshavardhan-portfolio";
const KEY = "site-visits";

const fetchJSON = async (url, { timeout = 8000 } = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }
    return await res.json();
  } finally {
    clearTimeout(id);
  }
};

const CountAPI = {
  hit: async () => {
    return await fetchJSON(
      `https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}?t=${Date.now()}`
    );
  },
  get: async () => {
    return await fetchJSON(
      `https://api.countapi.xyz/get/${NAMESPACE}/${KEY}?t=${Date.now()}`
    );
  },
  create: async () => {
    const params = `namespace=${encodeURIComponent(NAMESPACE)}&key=${encodeURIComponent(KEY)}&value=0`;
    return await fetchJSON(`https://api.countapi.xyz/create?${params}`);
  },
};

// Fallback using hits.seeyoufarm.com (increments via SVG badge; we parse the count)
const hitsIncr = async () => {
  const urlToTrack = encodeURIComponent(
    `${window.location.origin}${window.location.pathname}`
  );
  const url = `https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=${urlToTrack}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "image/svg+xml" },
    });
    if (!res.ok) throw new Error("hits.sh failed");
    const svg = await res.text();
    const matches = [...svg.matchAll(/>([0-9,]+)</g)];
    const last = matches.length ? matches[matches.length - 1][1] : null;
    const value = last ? parseInt(last.replace(/,/g, ""), 10) : null;
    if (typeof value === "number" && !Number.isNaN(value)) {
      return { value };
    }
    throw new Error("Failed to parse hits count");
  } finally {
    clearTimeout(id);
  }
};

// Fallback using visitorbadge.io JSON API (increments on read)
const visitorBadge = async () => {
  const path = encodeURIComponent(
    `${window.location.hostname}${window.location.pathname}`
  );
  const url = `https://api.visitorbadge.io/api/visitors?path=${path}&label=visits&format=json`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("visitorbadge failed");
    const json = await res.json();
    const value = json?.count ?? json?.data?.count;
    if (typeof value === "number") return { value };
    throw new Error("Invalid visitorbadge response");
  } finally {
    clearTimeout(id);
  }
};

const formatNumber = (n) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

const VisitCounter = () => {
  const [count, setCount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const alreadyCounted = sessionStorage.getItem("visitCounted") === "1";
      const endpoint = "/api/visits";
      try {
        const res = await fetch(endpoint, {
          method: alreadyCounted ? "GET" : "POST",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setCount(data?.value ?? 0);
            if (!alreadyCounted) sessionStorage.setItem("visitCounted", "1");
            return;
          }
        }
        throw new Error("api/visits failed");
      } catch (_) {
        // Client-side fallbacks if serverless not configured yet
        try {
          const dataA = await (alreadyCounted ? CountAPI.get() : CountAPI.hit());
          if (!cancelled) {
            setCount(dataA?.value ?? 0);
            if (!alreadyCounted) sessionStorage.setItem("visitCounted", "1");
            return;
          }
        } catch (_) {}
        try {
          const dataB = await hitsIncr();
          if (!cancelled) {
            setCount(dataB?.value ?? 0);
            if (!alreadyCounted) sessionStorage.setItem("visitCounted", "1");
            return;
          }
        } catch (_) {}
        try {
          const dataC = await visitorBadge();
          if (!cancelled) {
            setCount(dataC?.value ?? 0);
            if (!alreadyCounted) sessionStorage.setItem("visitCounted", "1");
            return;
          }
        } catch (e4) {
          if (!cancelled) setError("Unable to load visits");
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <Wrapper>
        <Dot />
        <span>Total visits: N/A</span>
      </Wrapper>
    );
  }

  return (
    <Wrapper aria-live="polite">
      <Dot />
      <span>Total visits: </span>
      <Count>{count === null ? "..." : formatNumber(count)}</Count>
    </Wrapper>
  );
};

export default VisitCounter;


