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

To set up github-hetzner-runners, the first step is to create a GitHub repository named **demo-testflows-github-hetzner-runners**.After creating the repository, you need to establish a GitHub Actions workflow, which involves modifying an example YAML configuration to specify that the job will run on a self-hosted runner with specific labels like type-cpx21. This setup is detailed in the provided demo.yml file, which includes various steps and commands for the workflow. The final step in the setup process is creating a GitHub API token with workflow privileges, which is essential for managing the actions in the repository. It's crucial to securely save this token for subsequent use in setting up and managing the GitHub Actions.

The repository name will have the following format:

::

   <username>/demo-testflows-github-hetzner-runners

For me, my GitHub repository is:

::

   vzakaznikov/demo-testflows-github-hetzner-runners

To modify the example YAML configuration and specify that our job will run on a runner with the **self-hosted** and the **type-cpx21**
labels:

.. code-block:: yaml

     Explore-GitHub-Actions:
       runs-on: [self-hosted, type-cpx21]

To complete *demo.yml* that uses a self-hosted runner is as follows:  

:demo.yml:

   .. code-block:: yaml

      name: GitHub Actions Demo
      run-name: ${{ github.actor }} is testing out GitHub Actions 🚀
      on: [push]
      jobs:
        Explore-GitHub-Actions:
          runs-on: [self-hosted, type-cpx21]
          steps:
            - run: echo "🎉 The job was automatically triggered by a ${{ github.event_name }} event."
            - run: echo "🐧 This job is now running on a ${{ runner.os }} server hosted by GitHub!"
            - run: echo "🔎 The name of your branch is ${{ github.ref }} and your repository is ${{ github.repository }}."
            - name: Check out repository code
              uses: actions/checkout@v3
            - run: echo "💡 The ${{ github.repository }} repository has been cloned to the runner."
            - run: echo "🖥️ The workflow is now ready to test your code on the runner."
            - name: List files in the repository
              run: |
                ls ${{ github.workspace }}
            - run: echo "🍏 This job's status is ${{ job.status }}."

To create a GitHub API token with the **workflow** privileges:

For me, my *demo* GitHub token is:

::

   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

You should now have your GitHub repository ready.

See these steps in action:

.. image:: https://raw.githubusercontent.com/testflows/TestFlows-GitHub-Hetzner-Runners/master/docs/images/github_create_repo_and_token.gif
   :align: center
   :width: 790px
   :alt: Creating a GitHub Repository and Token

The next essential step in setting up the github-hetzner-runners that involves creating a Hetzner Cloud project and generating an API token for managing server instances. Begin by establishing a new project, named for example,**Demo GitHub Runners**. Once the project is set up, the next task is to create an API token within the Hetzner Cloud platform. This token plays a key role as it grants the necessary permissions to create and manage server instances within your Hetzner Cloud project. It’s important to securely store this token, as it will be used later in the configuration process. After completing these steps, your Hetzner Cloud project is ready for integration with the GitHub runners.

See these steps in action:

.. image:: https://raw.githubusercontent.com/testflows/TestFlows-GitHub-Hetzner-Runners/master/docs/images/hetzner_create_project_and_token.gif
   :align: center
   :width: 790px
   :alt: Creating a GitHub Repository and Token

Once you have prepared your GitHub repository and acquired both GitHub and Hetzner Cloud tokens, you're ready to implement the github-hetzner-runners service to a Hetzner Cloud instance. This ensures that the service operates in the cloud rather than on a local machine, enhancing efficiency and scalability. The process involves creating an instance of **github-hetzner-runners** within your Hetzner Cloud project. To execute this, you use the **github-hetzner-runners cloud deploy** command,and specify your
GitHub repository, GitHub, and Hetzner Cloud tokens using **GITHUB_REPOSITORY**, **GITHUB_TOKEN**, and **HETZNER_TOKEN** environment variables.This process is straightforward and, once completed, results in an active and operational cloud service, ready to manage your GitHub Actions workflows.

See these steps in action:

.. image:: https://raw.githubusercontent.com/testflows/TestFlows-GitHub-Hetzner-Runners/master/docs/images/cloud_deploy.gif
   :align: center
   :width: 625px
   :alt: Deploying Cloud Service

Once the **github-hetzner-runners** cloud service is activated, the process becomes effortlessly manageable. You can now relax and observe as **github-hetzner-runners** efficiently handles the workload, automatically spinning up new runners as needed. These runners are tasked with executing the queued GitHub Actions jobs in your repository. 

See this step in action:

.. image:: https://raw.githubusercontent.com/testflows/TestFlows-GitHub-Hetzner-Runners/master/docs/images/github_job_completed.gif
   :align: center
   :width: 790px
   :alt: Waiting For the GitHub Actions Job to Complete

   









