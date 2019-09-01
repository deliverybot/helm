app
===
A Helm chart for Kubernetes

Current chart version is `0.0.2`





## Chart Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` | Kubernetes affinity resource. |
| env | string | `nil` | Environment variables for the application. |
| fullnameOverride | string | `""` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"nginx"` |  |
| image.tag | string | `"latest"` |  |
| imagePullSecrets | list | `[]` |  |
| ingress.annotations | object | `{}` | Configures annotations for the ingress. |
| ingress.enabled | bool | `false` | Enable ingress resource. |
| ingress.hosts[0].host | string | `"chart-example.local"` | Host name for routing traffic. |
| ingress.hosts[0].paths | list | `["/"]` | Array of routable paths. |
| ingress.tls | list | `[]` | Kubernetes ingress tls resource. |
| livenessProbe | object | `{"httpGet":{"path":"/healthz","port":"http"}}` | Customize the livenessProbe. |
| nameOverride | string | `""` |  |
| nodeSelector | object | `{}` | Kubernetes node selectors for Deployment resources. |
| readinessProbe | object | `{"httpGet":{"path":"/healthz","port":"http"}}` | Customize the readiness probe. |
| replicaCount | int | `1` | Replica count for deployments. |
| resources | object | `{}` | Kubernetes resources for Deployment resources. |
| secrets | list | `[]` | Creates a secret for the application. All variables passed in env. |
| service.enabled | bool | `true` | Enable service resource. |
| service.internalPort | int | `80` | Deployment internal port. |
| service.port | int | `80` | Kubernetes service port. |
| service.type | string | `"ClusterIP"` | Kubernetes service type. |
| tolerations | list | `[]` | Kubernetes tolerations for Deployment resources. |
