# register-azure-machine-learning-model-to-workspace

Github Action to register an Azure Machine Learning Model in a workspace.

Features:

* Register a model in an Azure Machine Learning workspace
* Checks if the model already exists in the workspace
* Checks if the resource group and workspace exist

For other Azure Machine Learning actions check out:

* [create-azure-machine-learning-online-endpoint](https://github.com/marketplace/actions/create-azure-machine-learning-online-endpoint)
* [create-azure-machine-learning-online-deployment](https://github.com/marketplace/actions/create-azure-machine-learning-deployment)
* [move-azure-machine-learning-model-to-registry](https://github.com/marketplace/actions/move-azure-machine-learning-model-to-registry)
* [register-azure-machine-learning-model-to-workspace](https://github.com/marketplace/actions/register-azure-machine-learning-model-to-workspace)

## Dependencies on other Github Actions

* Authenticate using [Azure Login](https://github.com/Azure/login)

## 🚀 Usage

### **1. Add to Your Workflow**

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2.3.2

      - uses: Azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Register model in Azure Machine Learning workspace
        uses: coding-kitties/register-azure-machine-learning-model-to-workspace@v0.1.1
        with:
          model_name: '<model-name>'
          model_version: '<model-version>'
          resource_group: '<resource-group>'
          workspace_name: '<workspace-name>'
          model_path: '<path-to-model>'
```

## Example deployment of an Azure Machine Learning Workflow with blue/green deployments

This example demonstrates an Azure Machine Learning Deployment with blue/green deployments for different environments. We use various Github Actions to create a complete workflow.

```yaml
name: Release Azure Machine Learning Model

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      MODEL_NAME: '<model-name>'
      MODEL_VERSION: '<model-version>'
      RESOURCE_GROUP: '<resource-group>'
      WORKSPACE_NAME: '<workspace-name>'
      ENDPOINT_NAME: '<endpoint-name>'
      MODEL_PATH: '<path-to-model>'

    steps:
      - name: Checkout repository
        uses: actions/checkout@v2

      - name: Azure CLI login
        uses: Azure/login@v2.2.0
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      # Register model in Azure Machine Learning workspace
      - name: Register model in Azure Machine Learning workspace
        uses: coding-kitties/register-azure-machine-learning-model-to-workspace@v0.1.1
        with:
          model_name: ${{ env.MODEL_NAME }}
          model_version: ${{ env.MODEL_VERSION }}
          resource_group: ${{ env.RESOURCE_GROUP }}
          workspace_name: ${{ env.WORKSPACE_NAME }}
          model_path: ${{ env.MODEL_PATH }}

      # Create Azure Machine Learning Online Endpoint
      - name: Create AML Online Endpoint
        uses: coding-kitties/create-aml-online-endpoint@v0.3.1
        with:
          endpoint_name: ${{ env.ENDPOINT_NAME }}
          resource_group: ${{ env.RESOURCE_GROUP }}
          workspace_name: ${{ env.WORKSPACE_NAME }}
```
