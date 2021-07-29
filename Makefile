ifneq (,)
This makefile requires GNU Make.
endif


# Project-related variables
PROJECT:=cad-ray
ACR_NAME:=cadray
Build.BuildId:=32
DOCKER_TAG:=$(Build.BuildId)
SERVICE_PRINCIPAL_NAME:=acr-service-principal
RESOURCE_GROUP_NAME:=$(PROJECT)-shared
RESORUCE_GROUP_LOCATION:="West Europe"
STORAGE_ACCOUNT_NAME:=cadrayterraformstate
CONTAINER_NAME:=terraform-state
ENVIRONMENT:=staging
TERRAFORM_VARIABLES_FILE:="infrastructure/environments/docker.tfvars"

# Build and test tools abstraction
AZ:=$(shell which az) # https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest
TF:=$(shell which terraform) # https://learn.hashicorp.com/tutorials/terraform/install-cli

# target: make help - displays this help.
.PHONY: help
help:
	@egrep '^# target' [Mm]akefile

# target: make create-acr-service-principal
.PHONY: create-acr-service-principal
create-acr-service-principal:
	$(eval ACR_REGISTRY_ID=$(shell $(AZ) acr show --name $(ACR_NAME) --query id --output tsv))
	$(eval SP_PASSWD=$(shell $(AZ) ad sp create-for-rbac --name http://$(SERVICE_PRINCIPAL_NAME) --scopes $(ACR_REGISTRY_ID) --role acrpull --query password --output tsv))
	$(eval SP_APP_ID=$(shell $(AZ) ad sp show --id http://$(SERVICE_PRINCIPAL_NAME) --query appId --output tsv))
	@echo "Service principal ID: ${SP_APP_ID}"
	@echo "Service principal password: ${SP_PASSWD}"

# target: make init-terraform-state - Initilizes Terraform remote state storage
.PHONY: init-terraform-state
init-terraform-state:
	$(AZ) group create --name $(RESOURCE_GROUP_NAME) --location $(RESORUCE_GROUP_LOCATION)
	$(AZ) storage account create --resource-group $(RESOURCE_GROUP_NAME) --name $(STORAGE_ACCOUNT_NAME) --sku Standard_LRS --encryption-services blob
	$(eval ACCOUNT_KEY=$(shell $(AZ) storage account keys list --resource-group $(RESOURCE_GROUP_NAME) --account-name $(STORAGE_ACCOUNT_NAME) --query [0].value -o tsv))
	$(AZ) storage container create --name $(CONTAINER_NAME) --account-name $(STORAGE_ACCOUNT_NAME) --account-key $(ACCOUNT_KEY)
	@echo storage_account_name: $(STORAGE_ACCOUNT_NAME)
	@echo container_name: $(CONTAINER_NAME)
	@echo access_key: $(ACCOUNT_KEY)
	$(TF) init -backend-config=infrastructure/azurecreds.conf infrastructure

# target: make plan-terraform - Shows required changes/plan to update Terraform state
.PHONY: plan-terraform
plan-terraform: select-terraform-workspace
	$(TF) plan -var-file=$(TERRAFORM_VARIABLES_FILE) -var docker_tag=$(DOCKER_TAG) infrastructure

# target: make apply-terraform - Apply required changes to update Terraform state
.PHONY: apply-terraform
apply-terraform: select-terraform-workspace
	$(TF) apply -auto-approve -var-file=$(TERRAFORM_VARIABLES_FILE) -var docker_tag=$(DOCKER_TAG) infrastructure

# target: make destroy-terraform - Destroy the resource group and all related infrastructure
.PHONY: destroy-terraform
destroy-terraform: select-terraform-workspace
	$(TF) destroy -auto-approve -var-file=$(TERRAFORM_VARIABLES_FILE) infrastructure

# target: make validate-terraform - validate Terraform configs
.PHONY: validate-terraform
validate-terraform:
	$(TF) validate infrastructure

# target: make select-terraform-workspace - activate the selected Terraform workspace
.PHONY: select-terraform-workspace
select-terraform-workspace:
	$(TF) workspace select $(ENVIRONMENT) infrastructure
