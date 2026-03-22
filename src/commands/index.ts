#!/usr/bin/env bun

import { program } from "commander";
import schema from "./schema";
import typedef from "./typedef";
import backup from "./backup";
import restore from "./restore";
import admin from "./admin";

/**
 * # Declare Global Variables
 */
declare global {}

/**
 * # Describe Program
 */
program
    .name(`bun-sqlite`)
    .description(`SQLite manager for Bun`)
    .version(`1.0.0`);

/**
 * # Declare Commands
 */
program.addCommand(schema());
program.addCommand(typedef());
program.addCommand(backup());
program.addCommand(restore());
program.addCommand(admin());

/**
 * # Handle Unavailable Commands
 */
program.on("command:*", () => {
    console.error(
        "Invalid command: %s\nSee --help for a list of available commands.",
        program.args.join(" "),
    );
    process.exit(1);
});

/**
 * # Parse Arguments
 */
program.parse(Bun.argv);
