"use client";

import Results from "../components/Results";

export default function HistoricResultsClient(props: {
  assemblyaiId: string;
  fileName: string | null;
  source: "upload" | "recording";
  estimatedSeconds: number;
}) {
  return (
    <Results
      submission={{
        assemblyaiId: props.assemblyaiId,
        fileName: props.fileName,
        source: props.source,
        estimatedSeconds: props.estimatedSeconds,
      }}
      onReset={() => {
        window.location.href = "/app";
      }}
    />
  );
}
