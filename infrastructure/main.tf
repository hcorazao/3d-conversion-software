terraform {
    required_version = ">= 0.12"
    backend "azurerm" {
        resource_group_name = "cad-ray-shared"
        storage_account_name = "cadrayterraformstate"
        container_name = "terraform-state"
        key = "cad-ray.tfstate"
    }
}

provider "azurerm" {
    environment = "public"
    features {}
}

resource "azurerm_resource_group" "rg" {
    name = "cr-${terraform.workspace}-tf-web-${var.app_type}"
    location = var.location
}

resource "azurerm_app_service_plan" "appserviceplan" {
    name                = "${azurerm_resource_group.rg.name}-plan"
    location            = azurerm_resource_group.rg.location
    resource_group_name = azurerm_resource_group.rg.name

    kind = "Linux"
    reserved = true

    sku {
        tier = "Basic"
        size = "B1"
    }
}

resource "azurerm_app_service" "dockerapp" {
    name                = azurerm_resource_group.rg.name
    location            = azurerm_resource_group.rg.location
    resource_group_name = azurerm_resource_group.rg.name
    app_service_plan_id = azurerm_app_service_plan.appserviceplan.id

    # Do not attach Storage by default
    app_settings = {
        WEBSITES_ENABLE_APP_SERVICE_STORAGE = false

        DOCKER_REGISTRY_SERVER_URL      = "cadray.azurecr.io"
        DOCKER_REGISTRY_SERVER_USERNAME = var.docker_username
        DOCKER_REGISTRY_SERVER_PASSWORD = var.docker_password
        API_URL = var.api_url
        WEBSITES_PORT = 8080
        OAUTH_CLIENT_ID = var.oauth_client_id
        TENANT_NAME = var.tenant_name
        TENANT_ID = var.tenant_id
    }

    # Configure Docker Image to load on start
    site_config {
        linux_fx_version = "DOCKER|cadray.azurecr.io/web-app:${var.docker_tag}"
        always_on        = "true"
    }

    identity {
        type = "SystemAssigned"
    }
}
