# 📦 PyPI Publishing Guide

Step-by-step guide to publish your `agentops-monitor` SDK to PyPI.

---

## ✅ Pre-Publishing Checklist

- [x] Package structure correct (`agentops_monitor/`)
- [x] `pyproject.toml` configured
- [x] `setup.py` for backward compatibility
- [x] `README.md` with examples
- [x] `LICENSE` file (MIT)
- [x] Version set (0.1.0)
- [ ] Package tested locally
- [ ] PyPI account created
- [ ] TestPyPI account created (optional but recommended)

---

## 🚀 Quick Start (TL;DR)

```bash
cd sdk

# 1. Install tools
pip install build twine

# 2. Build
python -m build

# 3. Upload to TestPyPI (test first!)
python -m twine upload --repository testpypi dist/*

# 4. Test installation
pip install --index-url https://test.pypi.org/simple/ agentops-monitor

# 5. If good, upload to production PyPI
python -m twine upload dist/*

# Done! Users can now: pip install agentops-monitor
```

---

## 📋 Detailed Steps

### Step 1: Set Up PyPI Accounts

#### Create TestPyPI Account (Recommended)

1. Go to: https://test.pypi.org/account/register/
2. Verify email
3. Generate API token:
   - Go to: https://test.pypi.org/manage/account/token/
   - Click "Add API token"
   - Name: "agentops-monitor-upload"
   - Scope: "Entire account"
   - Copy token: `pypi-...`

#### Create Production PyPI Account

1. Go to: https://pypi.org/account/register/
2. Verify email
3. Generate API token (same as above):
   - https://pypi.org/manage/account/token/

---

### Step 2: Configure .pypirc (Optional)

Create `~/.pypirc` to save credentials:

```ini
[distutils]
index-servers =
    pypi
    testpypi

[pypi]
username = __token__
password = pypi-YOUR-PRODUCTION-TOKEN-HERE

[testpypi]
username = __token__
password = pypi-YOUR-TEST-TOKEN-HERE
repository = https://test.pypi.org/legacy/
```

**Security:** Make sure this file is NOT committed to git!

---

### Step 3: Prepare Your Package

#### Check Current Directory

```bash
cd /path/to/agentops-monitor/sdk
ls
# Should see:
# - agentops_monitor/
# - pyproject.toml
# - setup.py
# - README.md
# - LICENSE
```

#### Update Version (if needed)

Edit `pyproject.toml`:

```toml
[project]
name = "agentops-monitor"
version = "0.1.0"  # ← Update this for each release
```

Edit `setup.py` too:

```python
setup(
    name="agentops-monitor",
    version="0.1.0",  # ← Keep in sync
    ...
)
```

#### Clean Previous Builds

```bash
rm -rf dist/ build/ *.egg-info
```

---

### Step 4: Test Package Locally

```bash
# Install in development mode
pip install -e .

# Test imports work
python -c "from agentops_monitor import monitor_agent; print('✅ OK')"

# Test with example
cd examples
python test_tool_capture.py

# If errors, fix them before publishing!
```

---

### Step 5: Build the Package

```bash
cd sdk

# Install build tools if not already installed
pip install build twine

# Build distribution packages
python -m build
```

**Output:**

```
Successfully built agentops_monitor-0.1.0.tar.gz and agentops_monitor-0.1.0-py3-none-any.whl
```

**Files created in `dist/`:**

- `agentops_monitor-0.1.0.tar.gz` - Source distribution
- `agentops_monitor-0.1.0-py3-none-any.whl` - Wheel distribution

---

### Step 6: Upload to TestPyPI (Recommended)

Test your package on TestPyPI before going to production:

```bash
# Upload to TestPyPI
python -m twine upload --repository testpypi dist/*

# You'll be prompted:
# Username: __token__
# Password: pypi-YOUR-TEST-TOKEN
```

**Or with .pypirc configured:**

```bash
twine upload -r testpypi dist/*
```

**Output:**

```
Uploading distributions to https://test.pypi.org/legacy/
Uploading agentops_monitor-0.1.0-py3-none-any.whl
Uploading agentops_monitor-0.1.0.tar.gz

View at:
https://test.pypi.org/project/agentops-monitor/
```

---

### Step 7: Test Installation from TestPyPI

```bash
# Create a new virtual environment
python -m venv test-env
source test-env/bin/activate  # On Windows: test-env\Scripts\activate

# Install from TestPyPI
pip install --index-url https://test.pypi.org/simple/ agentops-monitor

# Note: Dependencies might fail on TestPyPI, that's OK
# To install with dependencies from regular PyPI:
pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple/ agentops-monitor

# Test it works
python -c "from agentops_monitor import monitor_agent; print('✅ TestPyPI install works!')"

# Deactivate
deactivate
```

---

### Step 8: Upload to Production PyPI

Once you've tested and everything works:

```bash
cd sdk

# Upload to production PyPI
python -m twine upload dist/*

# You'll be prompted:
# Username: __token__
# Password: pypi-YOUR-PRODUCTION-TOKEN
```

**Output:**

```
Uploading distributions to https://upload.pypi.org/legacy/
Uploading agentops_monitor-0.1.0-py3-none-any.whl
Uploading agentops_monitor-0.1.0.tar.gz

View at:
https://pypi.org/project/agentops-monitor/
```

🎉 **Your package is now live on PyPI!**

---

### Step 9: Verify Public Installation

```bash
# Anyone in the world can now install your package:
pip install agentops-monitor

# Test it
python -c "import agentops_monitor; print(agentops_monitor.__version__)"
# Output: 0.1.0
```

---

## 🔄 Publishing Updates

When you want to release a new version:

### 1. Update Version Number

**In `pyproject.toml`:**

```toml
version = "0.1.1"  # or 0.2.0, 1.0.0, etc.
```

**In `setup.py`:**

```python
version="0.1.1",
```

**Versioning Guide:**

- **0.1.0 → 0.1.1** - Bug fixes (patch)
- **0.1.0 → 0.2.0** - New features (minor)
- **0.1.0 → 1.0.0** - Breaking changes (major)

### 2. Update Changelog

Add to `sdk/CHANGELOG.md`:

```markdown
## [0.1.1] - 2025-11-27

### Fixed

- Bug in trace serialization
- Retry logic timeout

### Added

- Background trace sending
```

### 3. Clean, Build, Upload

```bash
# Clean old builds
rm -rf dist/ build/

# Build new version
python -m build

# Upload to PyPI
python -m twine upload dist/*
```

### 4. Tag the Release on GitHub

```bash
git tag -a v0.1.1 -m "Release version 0.1.1"
git push origin v0.1.1
```

---

## 🔍 Troubleshooting

### Error: "File already exists"

You're trying to upload a version that already exists on PyPI.

**Solution:** Bump the version number and rebuild.

### Error: "Invalid distribution filename"

Your package name has issues.

**Solution:** Check that package name in `pyproject.toml` matches directory name:

- Directory: `agentops_monitor/`
- Package name: `agentops-monitor` (hyphens OK)

### Error: "README rendering failed"

Your README has Markdown issues.

**Solution:** Test with:

```bash
pip install readme-renderer
python -m readme_renderer README.md
```

### Package installs but imports fail

**Issue:** Wrong package configuration.

**Check:**

```python
# In pyproject.toml
[tool.setuptools]
packages = ["agentops_monitor", "agentops_monitor.adk"]

# Make sure all __init__.py files exist
find agentops_monitor -name "__init__.py"
```

---

## 📊 After Publishing

### 1. Verify on PyPI

Visit: https://pypi.org/project/agentops-monitor/

Check:

- ✅ Description renders correctly
- ✅ Installation command shown
- ✅ Dependencies listed
- ✅ Project links work

### 2. Update Documentation

Update your README to include:

````markdown
## Installation

```bash
pip install agentops-monitor
```
````

Latest version: [![PyPI version](https://badge.fury.io/py/agentops-monitor.svg)](https://badge.fury.io/py/agentops-monitor)

````

### 3. Announce

- Tweet about it
- Post on Reddit (r/Python, r/MachineLearning)
- Share on LinkedIn
- Add to Gemini Discord
- Post in ADK community

### 4. Monitor

- Check PyPI download stats: https://pypistats.org/packages/agentops-monitor
- Watch for issues on GitHub
- Monitor user questions

---

## 📝 Best Practices

### Before Each Release

1. ✅ Test locally (`pip install -e .`)
2. ✅ Run tests if you have them
3. ✅ Update version number
4. ✅ Update CHANGELOG
5. ✅ Test on TestPyPI first
6. ✅ Only then push to production PyPI

### Package Quality

- Keep README clear and concise
- Provide working examples
- Document all environment variables
- Include quickstart guide
- Add badges (version, downloads, license)
- Keep dependencies minimal

### Maintenance

- Respond to GitHub issues
- Release bug fixes quickly
- Keep dependencies updated
- Document breaking changes
- Follow semantic versioning

---

## 🎯 Final Checklist Before First Publish

- [ ] Package name is available on PyPI
- [ ] README.md is clear and helpful
- [ ] LICENSE file is included
- [ ] All examples work
- [ ] Package installs cleanly (`pip install -e .`)
- [ ] Imports work (`from agentops_monitor import monitor_agent`)
- [ ] Version is set to 0.1.0
- [ ] PyPI account created
- [ ] API token generated
- [ ] Tested on TestPyPI successfully

---

## 🚀 Ready to Publish?

```bash
cd sdk
python -m build
python -m twine upload dist/*
````

That's it! Your SDK is now publicly available for anyone to use! 🎉

Users can install with:

```bash
pip install agentops-monitor
```

---

**Good luck with your launch! 🚀**
