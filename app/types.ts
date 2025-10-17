export type ProcessingStep =
    | "idle"
    | "transcribing"
    | "extracting"
    | "saving"
    | "creating"
    | "complete"
    | "error";

export type OutputMode = "json" | "markdown";

export interface ProcessedResults {
    transcript: string;
    tasks: any[];
    events: any[];
    notes: any[];
    storageInfo?: {
        note_id: string;
        storage_url: string;
        created_at: string;
    };
}

export interface MarkdownResults {
    transcript: string;
    markdown: string;
    storageInfo?: {
        note_id: string;
        storage_url: string;
        created_at: string;
        storage_type?: string;
    };
}
