import { forwardRef } from "react"

interface CurvedMemoryPathProps {
  pathData: string
  height: number
}

export const CurvedMemoryPath =
  forwardRef<SVGPathElement, CurvedMemoryPathProps>(function CurvedMemoryPath(
    { pathData, height },
    pathRef,
  ) {
    return (
      <svg
        className="journey-path"
        viewBox={`0 0 1000 ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="pathGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7d994" stopOpacity=".2" />
            <stop offset="48%" stopColor="#e9a95e" stopOpacity=".85" />
            <stop offset="100%" stopColor="#f7d994" stopOpacity=".12" />
          </linearGradient>
        </defs>
        <path className="path-shadow" d={pathData} />
        <path className="path-base" d={pathData} />
        <path className="path-shimmer" d={pathData} />
        <path ref={pathRef} className="path-progress" d={pathData} />
      </svg>
    )
  })
