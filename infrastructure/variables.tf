variable "app_type" {
  type = string
  default = "app"
}

variable "location" {
  type = string
  default = "East US 2"
}

variable "docker_tag" {
    type = string
    default = "latest"
}

variable "docker_username" {
    type = string
    default = "test"
}

variable "docker_password" {
    type = string
    default = "test"
}

variable "api_url" {
    type = string
    default = "https://cr-staging-tf-web-app.azurewebsites.net"
}

variable "oauth_client_id" {
    type = string
    default = ""
}

variable "tenant_name" {
    type = string
    default = ""
}

variable "tenant_id" {
    type = string
    default = ""
}
