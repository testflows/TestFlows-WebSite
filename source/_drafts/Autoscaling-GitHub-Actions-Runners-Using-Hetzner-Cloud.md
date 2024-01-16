---
post: true
title: "Autoscaling GitHub Actions Runners Using Hetzner Cloud"
description: FIXME
date: 2024-01-10
author: Vitaliy Zakaznikov
image: FIXME
icon: fas fa-glasses pt-5 pb-5
---

Discover how you can Autoscaling GitHub Actions Runners Using Hetzner Cloud,using github-hetzner-runners service,a practical tool designed to enhance the efficiency of GitHub Actions workflows. This service automatically starts servers in Hetzner Cloud when new GitHub Actions jobs are queued, providing dedicated and ephemeral runners for each task. Once a job is completed, the service takes care of shutting down and deleting the server, ensuring a cost-effective and streamlined process. This article will cover how github-hetzner-runners supports both x64 and arm64 runners, its straightforward setup, and how it manages costs effectively, making it a smart choice for any GitHub repository.


# How Does GitHub Actions Runners transform GitHub Actions Workflows?

This service offers an innovative solution for GitHub Actions workflows by providing cost-efficient, on-demand runners utilizing Hetzner Cloud. It stands out for its simple configuration process, eliminating the need for complex setups like Webhooks, AWS Lambdas, or additional GitHub applications. Users benefit from the ability to customize runner server types, images, and locations using job labels, making it highly adaptable to specific project needs. The service is a self-contained program, allowing for easy deployment, redeployment, and management directly on a cloud instance. It supports a wide range of runner types, including both x64 (x86) and ARM64 (arm) architectures, and is compatible with any Hetzner Cloud server types and standard images or applications, even those with pre-installed Docker. Efficiency is further enhanced with features like auto-replenishable standby runner pools for immediate job uptake and the ability to limit the number of runners per workflow, ensuring resources are used wisely. Additionally, it optimizes GitHub API interactions through HTTP caching and conditional requests, presenting itself as a simpler, more efficient alternative to other autoscaling solutions recommended by GitHub.


# Understanding the Hetzner Cloud Utility's Requirements and Installation

GitHub Actions Runners presents a specific operational limitations and requirements, that are crucial for its successful implementation and use.It does not support group runners and it requires a separate Hetzner Cloud projects for individual services per repository. This approach, while limiting concurrent repository management, facilitates cost tracking for each project.To utilize this utility, users must have Python version 3.7 or higher, a Hetzner Cloud account, and a GitHub API token with administrative rights. Installation is straightforward: GitHub Actions Runners can be installed via pip and requires confirmation of correct installation. It's important to ensure that the  installation directory, ~/.local/bin/, is included in the system's PATH. For Ubuntu users, this might involve modifying the ~/.profile to append the directory to the PATH, guaranteeing the utility's seamless integration into the user’s environment.


# Implementing Autoscaling GitHub Actions with Hetzner Runners

The installation process for TestFlows GitHub Runners begins with installing the **testflows.github.hetzner.runners** Python package using the pip3 command. After installation, it’s crucial to verify that **github-hetzner-runners** utility has been correctly installed by executing the **github-hetzner-runners -v** command.Github-hetzner-runners is typically installed in the ~/.local/bin/ directory, and users must ensure that this directory is part of their system's PATH environment variable. For Ubuntu users, this might require updating the ~/.profile file to include the directory. Additionally, for launching **github-hetzner-runners** program, it’s necessary to specify the GitHub repository along with GitHub and Hetzner Cloud tokens, which need to be created and securely stored.










