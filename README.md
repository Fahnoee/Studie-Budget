# StudieBudget

StudieBudget is a budgeting web application designed to help Danish students effectively manage their finances, learn budgeting principles through gamified features, and promote ethical spending habits.

## Expected Features

- **Expense Tracking:** Easily track your expenses and see where your money is going.
- **Budget Explanations:** Understand budgeting concepts with clear explanations tailored to students.
- **Gamified Learning:** Engage with gamified features that make learning about budgeting fun and rewarding.
- **Ethicality Emphasis:** Promote ethical spending practices by integrating educational resources and tools.

## Getting Started

StudieBudget is currently under development. Here are the guidelines:
- **Team Collaboration:** Coordinate with project group to divide tasks and responsibilities.
- **Code Style:** Follow consistent coding conventions and style guidelines agreed upon by the team.
- **Version Control:** Use Git for version control. Create branches for new features or bug fixes and merge changes via pull requests.
- **Testing:** Write unit tests to ensure the reliability and functionality of the code.
- **Documentation:** Document the code, including functions, classes, and modules, to facilitate understanding and future maintenance.



### Essential Git Commands
#### 1. Cloning the Repository
git clone <repository-url> // Clones the repository from the specified URL to your local machine.
#### 2. Creating a Feature Branch
git checkout -b feature/YourFeature // Creates a new branch named feature/YourFeature and switches to it. Example: feature/Gamification
#### 3. Adding Changes
git add . // To stage all changes within the current directory and its subdirectories for the next commit.
git add file1.txt file2.txt // To stage all changes for specific files, in this case, file1.txt and file2.txt.
git add *.txt // To add all .txt files. Could also be *.js and so on.
#### 4. Committing Changes
git commit -m 'Add some feature' // Commits the staged changes with the provided commit message.
#### 5. Pushing Changes
git push origin feature/YourFeature // Pushes the committed changes from your local branch to the remote repository's branch named feature/YourFeature.
#### 6. Merging Changes (via Pull Request)
1. Push your changes to your forked repository.
2. Go to the GitHub repository page and click on "Compare & pull request".
3. Add a title and description to your pull request, then click "Create pull request".

### Clarification of staging and Committing 
#### Staging Changes
Staging changes in Git means preparing them to be committed to the repository. When you stage changes, you're essentially telling Git, "These are the changes I want to include in the next commit."
Staging allows you to selectively choose which changes you want to include in a commit. You can stage specific files or parts of files while leaving others unchanged.
Staging doesn't permanently record changes in the repository; it's more like preparing changes to be recorded.
#### Committing Changes:
Committing changes in Git means permanently saving the staged changes to the repository's history. When you commit changes, you're creating a snapshot of the project at that point in time.
Each commit has a unique identifier (a hash) and includes the changes that were staged at the time of the commit.
Commits provide a way to track the history of your project and revert to previous states if needed. They also serve as checkpoints or milestones in the development process.
Once changes are committed, they become part of the project's history, and you can reference them by their commit messages or identifiers.


## Feedback

If you have any feedback, suggestions, or questions about StudieBudget, please feel free to [open an issue](https://github.com/YourUsername/StudieBudget/issues/new). We'd love to hear from you!

## License

This project is licensed under the [MIT License](LICENSE).
