export interface Category {
  id: string;
  name: string;
  description: string;
  objects: string[];
}

export interface Functor {
  id: string;
  source_id: string;
  target_id: string;
  name: string;
  status: "VALID" | "CONFLICT" | "UNVALIDATED";
  mapping_rules: string[];
  reconciliation_expression: string;
}

export interface GraphEvent {
  id?: string;
  functor_id: string;
  event_type: "CONFLICT_RESOLVED" | "CONFLICT_DETECTED" | "MAPPING_UPDATED" | "VALIDATION_RUNNING";
  timestamp: any; // Date or firestore Timestamp
  details: {
    reconciliation_expression?: string;
    target_object_id?: string;
    message?: string;
    [key: string]: any;
  };
}
