export function registerProvider(program) {
  program
    .command("provider [subcommand]")
    .description("Manage provider connections (use 'providers' for the full interface)")
    .allowUnknownOption()
    .allowExcessArguments()
    .action(() => {
      console.log(`
  Use \`niyatnaroute providers\` for the full provider management interface:

    niyatnaroute providers available   — show provider catalog
    niyatnaroute providers list        — list configured connections
    niyatnaroute providers test <name> — test a provider connection
    niyatnaroute providers test-all    — test all active connections
    niyatnaroute providers validate    — validate local configuration
`);
    });
}
