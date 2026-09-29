# Environments

## Default

Claude Code runs on the Anthropic API with the project settings in `.claude/settings.json`. The service and the worker call the Claude API with the key in `.env`.

## EU data-residency host

Work on EU tenants happens from the `eu-dev-01` jump host, where Claude Code runs on Amazon Bedrock in `eu-west-1`. The host's managed settings carry:

```json
{
  "env": {
    "CLAUDE_CODE_USE_BEDROCK": "1",
    "AWS_REGION": "eu-west-1",
    "ANTHROPIC_MODEL": "anthropic.claude-sonnet-5-5",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "anthropic.claude-sonnet-5"
  }
}
```

`ANTHROPIC_DEFAULT_SONNET_MODEL` names Sonnet 5 on that host because it is the model cyber-flagged requests re-run on. The EU worker jobs call Bedrock through `worker/bedrock_portal.py`.
