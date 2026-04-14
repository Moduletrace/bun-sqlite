import { ServerQueryEqualities } from "../types";
export default function sqlEqualityParser(eq) {
    switch (eq) {
        case "EQUAL":
            return "=";
        case "LIKE":
            return "LIKE";
        case "NOT LIKE":
            return "NOT LIKE";
        case "NOT EQUAL":
            return "<>";
        case "IS NOT":
            return "IS NOT";
        case "IN":
            return "IN";
        case "NOT IN":
            return "NOT IN";
        case "BETWEEN":
            return "BETWEEN";
        case "NOT BETWEEN":
            return "NOT BETWEEN";
        case "IS NULL":
            return "IS NULL";
        case "IS NOT NULL":
            return "IS NOT NULL";
        case "EXISTS":
            return "EXISTS";
        case "NOT EXISTS":
            return "NOT EXISTS";
        case "GREATER THAN":
            return ">";
        case "GREATER THAN OR EQUAL":
            return ">=";
        case "LESS THAN":
            return "<";
        case "LESS THAN OR EQUAL":
            return "<=";
        default:
            return "=";
    }
}
