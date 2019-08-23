# Helm Action

Deploys a helm chart using GitHub actions.

## Parameters

### Inputs

- `release`: Helm release name. (required)
- `namespace`: Kubernetes namespace name. (required)
- `chart`: Helm chart path. (required)
- `values`: Helm chart values, expected to be a YAML or JSON string.
- `dry-run`: Helm dry-run option.
- `token`: Github repository token. If included and the event is a deployment
  then the deployment_status event will be fired.

### Environment

- `KUBECONFIG`: Kubeconfig file for Kubernetes cluster access.

## Example

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: ['deployment']

jobs:
  deployment:
    runs-on: 'ubuntu-latest'
    steps:
    - uses: actions/checkout@v1

    - name: 'Deploy'
      uses: 'deliverybot/helm@v1'
      with:
        release: 'nginx'
        namespace: 'default'
        chart: './charts/my-app'
        token: '${{ github.token }}'
        values: |
          name: foobar
      env:
        KUBECONFIG_FILE: '${{ secrets.KUBECONFIG }}'
```
