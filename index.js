const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const exec = require('@actions/exec');


async function checkIfResourceGroupExists(resourceGroup) {
    /**
     * Check if the resource group exists.
     * @param {string} resourceGroup - The name of the resource group.
     * @return {boolean} - Returns true if the resource group exists, false otherwise.
     */
    let errorOutput = "";
    let output = "";

    try {
        const options = {
            listeners: {
                stdout: (data) => {
                    output += data.toString();
                },
                stderr: (data) => {
                    errorOutput += data.toString();
                }
            },
            silent: true
        };
        // Execute the Azure CLI command
        await exec.exec(`az group show --name ${resourceGroup} --resource-group ${resourceGroup}`, [], options);

        console.log("✅ Resource Group Found. Output:", output);
        return true;
    } catch (error) {
        console.log(
            "❌ Resource Group Not Found or Error Occurred:", errorOutput || error.message
        );
        return false; // Return false if the workspace does not exist
    }
}

async function checkIfWorkspaceExists(workspaceName, resourceGroup) {
    /**
     * Check if the workspace exists in the specified resource group.
     * @param {string} workspaceName - The name of the workspace.
     * @param {string} resourceGroup - The name of the resource group.
     * @return {boolean} - Returns true if the workspace exists, false otherwise.
     */
    let errorOutput = "";
    let output = "";

    try {
        const options = {
            listeners: {
                stdout: (data) => {
                    output += data.toString();
                },
                stderr: (data) => {
                    errorOutput += data.toString();
                }
            },
            silent: true
        };

        // Check if the workspace exists
        await exec.exec(`az ml workspace show --name ${workspaceName} --resource-group ${resourceGroup}`, [], options);
        console.log("✅ Resource Group Found. Output:", output);
        return true;
    } catch (error) {
        console.log(
            "❌ Resource Group Not Found or Error Occurred:", errorOutput || error.message
        );
        return false;
    }
}

async function checkIfModelInWorkspaceExists(
    modelName, modelVersion, workspaceName, resourceGroup
) {
    /**
     * Check if the model exists in the specified workspace.
     * @param {string} modelName - The name of the model.
     * @param {string} modelVersion - The version of the model.
     * @param {string} workspaceName - The name of the workspace.
     * @param {string} resourceGroup - The name of the resource group.
     * @return {boolean} - Returns true if the model exists, false otherwise.
     */

    let errorOutput = "";
    let output = "";

    try {
        const options = {
            listeners: {
                stdout: (data) => {
                    output += data.toString();
                },
                stderr: (data) => {
                    errorOutput += data.toString();
                }
            },
            silent: true
        };

        // Check if model exists in registry
        await exec.exec(`az ml model show --name ${modelName} --version ${modelVersion} --workspace-name ${workspaceName} --resource-group ${resourceGroup}`, [], options);
        console.log("✅ Model Found. Output:", output);
        return true;
    } catch (error) {
        return false;
    }
}

async function registerModelInWorkspace(
    modelName, modelVersion, modelPath, modelType, workspaceName, resourceGroup
) {
    /**
     * Register the model in the specified workspace.
     * @param {string} modelName - The name of the model.
     * @param {string} modelVersion - The version of the model.
     * @param {string} modelPath - The path to the model file.
     * @param {string} modelType - The type of the model.
     * @param {string} workspaceName - The name of the workspace.
     * @param {string} resourceGroup - The name of the resource group.
     * @return {boolean} - Returns true if the model is registered, false otherwise.
     */

    let errorOutput = "";
    let output = "";

    try {
        const options = {
            listeners: {
                stdout: (data) => {
                    output += data.toString();
                },
                stderr: (data) => {
                    errorOutput += data.toString();
                }
            },
            silent: true
        };
        console.log(modelPath)
        // Register the model in the workspace
        await exec.exec(`az ml model create --name ${modelName} --version ${modelVersion} --path ${modelPath} --workspace-name ${workspaceName} --resource-group ${resourceGroup} --type  ${modelType}`, [], options);
        console.log("✅ Model Registered. Output:", output);
        return true;
    } catch (error) {
        console.log(
            "❌ Model Not Registered or Error Occurred:", errorOutput || error.message
        );
        return false;
    }
}


try {
    // Get the input parameters
    const resourceGroup = core.getInput('resource-group');
    const workspaceName = core.getInput('workspace-name');
    const modelName = core.getInput('model-name');
    const modelVersion = core.getInput('model-version');
    const modelPath = core.getInput('model-path');
    const modelType = core.getInput('model-type');

    if(modelPath === undefined) {
        throw new Error("Model path is required.");
    }

    if(modelName === undefined) {
        throw new Error("Model name is required.");
    }

    if(modelVersion === undefined) {
        throw new Error("Model version is required.");
    }

    if(workspaceName === undefined) {
        throw new Error("Workspace name is required.");
    }

    if(resourceGroup === undefined) {
        throw new Error("Resource group is required.");
    }

    // Check if the resource group exists
    console.log(`🔹 Checking if resource group '${resourceGroup}' exists...`)
    ;
    let resourceGroupExists = await checkIfResourceGroupExists(resourceGroup);

    if (!resourceGroupExists) {
        throw new Error(`Resource group '${resourceGroup}' does not exist.`);
    } else {
        console.log(`✅ Resource group '${resourceGroup}' exists.`);
    }

    // Check if the workspace exists
    console.log(`🔹 Checking if workspace '${workspaceName}' exists in resource group '${workspaceName}'...`)
    ;
    const workspaceExists = await checkIfWorkspaceExists(workspaceName, resourceGroup);

    if (!workspaceExists) {
        throw new Error(`Workspace '${workspaceName}' does not exist in resource group '${resourceGroup}'.`);
    } else {
        console.log(`✅ Workspace '${workspaceName}' exists in resource group '${resourceGroup}'.`);
    }

    // Check if model exists in workspace
    console.log(`🔹 Checking if model '${modelName}' exists in workspace '${workspaceName}'...`);

    const modelInWorkspaceExists = await checkIfModelInWorkspaceExists(
        modelName, modelVersion, workspaceName, resourceGroup
    );

    if (modelInWorkspaceExists) {
        console.log(`✅ Model '${modelName}' with version '${modelVersion}' already exists in workspace '${workspaceName}'.`);
        process.exit(0);
    }

    // Register the model in the workspace
    console.log(`🔹 Registering model '${modelName}' with version '${modelVersion}' in workspace '${workspaceName}'...`);

    const modelRegistered = await registerModelInWorkspace(
        modelName, modelVersion, modelPath, modelType, workspaceName, resourceGroup
    );

    if (modelRegistered) {
        console.log(`✅ Model '${modelName}' with version '${modelVersion}' registered in workspace '${workspaceName}'.`);
    } else {
        throw new Error(`Model '${modelName}' with version '${modelVersion}' could not be registered in workspace '${workspaceName}'.`);
    }
} catch (error) {
    console.log(error.message);
    core.setFailed(`❌ Action failed: ${error.message}`);
}
