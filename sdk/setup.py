from setuptools import setup, find_packages

# This setup.py is maintained for backward compatibility with older pip versions.
# All package configuration is now in pyproject.toml.
# Modern pip versions (>=21.3) will use pyproject.toml automatically.

setup(
    name="agentops-monitor",
    version="0.1.1",
    packages=find_packages(),
    install_requires=[
        "requests>=2.31.0",
        "google-adk>=1.13.0",
        "google-genai>=1.0.0",
        "python-dotenv>=1.0.0",
    ],
    extras_require={
        "a2a": ["a2a-sdk>=0.3.16"],
        "dev": ["build>=1.0.0", "twine>=4.0.0", "pytest>=7.0.0"],
    },
    python_requires=">=3.8",
    author="AgentOps Monitor Team",
    author_email="sayandas.workmail@gmail.com",
    description="Monitoring SDK for AI agents built with Google ADK",
    long_description=open("README.md").read() if __name__ == "__main__" else "",
    long_description_content_type="text/markdown",
    url="https://github.com/sayandas24/agentops-monitor",
    license="MIT",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
)
