export function registerProvider(program) {
  program
    .command("provider [subcommand]")
    .description("Manage provider connections (use 'providers' for the full interface)")
    .allowUnknownOption()
    .allowExcessArguments()
    .action(() => {
      console.log(`
  Use \`dikaroute providers\` for the full provider management interface:

    dikaroute providers available   — show provider catalog
    dikaroute providers list        — list configured connections
    dikaroute providers test <name> — test a provider connection
    dikaroute providers test-all    — test all active connections
    dikaroute providers validate    — validate local configuration
`);
    });
}

