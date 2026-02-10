"""Tests for soul file persistence (src/memory/soul.py)."""

import os

import pytest

import src.memory.soul as soul_mod


@pytest.fixture
def soul_dir(tmp_path, monkeypatch):
    """Point the soul module at a temporary directory."""
    soul_path = os.path.join(str(tmp_path), "soul.md")
    monkeypatch.setattr(soul_mod, "_soul_path", soul_path)
    return tmp_path


class TestReadSoul:
    def test_returns_default_when_missing(self, soul_dir):
        text = soul_mod.read_soul()
        assert "# Soul of the Traveler" in text
        assert "## Identity" in text

    def test_returns_file_content(self, soul_dir):
        soul_mod.write_soul("custom content")
        assert soul_mod.read_soul() == "custom content"


class TestWriteSoul:
    def test_creates_file(self, soul_dir):
        soul_mod.write_soul("hello")
        assert soul_mod.read_soul() == "hello"

    def test_overwrites_file(self, soul_dir):
        soul_mod.write_soul("first")
        soul_mod.write_soul("second")
        assert soul_mod.read_soul() == "second"


class TestUpdateSoulSection:
    def test_updates_existing_section(self, soul_dir):
        soul_mod.write_soul("# Soul\n\n## Identity\nOld\n\n## Values\nOld values")
        result = soul_mod.update_soul_section("Identity", "New identity")
        assert "New identity" in result
        assert "Old values" in result

    def test_appends_new_section(self, soul_dir):
        soul_mod.write_soul("# Soul\n\n## Identity\nMe")
        result = soul_mod.update_soul_section("Hobbies", "Coding")
        assert "## Hobbies" in result
        assert "Coding" in result
        assert "## Identity" in result

    def test_preserves_other_sections(self, soul_dir):
        soul_mod.write_soul("# Soul\n\n## Identity\nA\n\n## Values\nB\n\n## Goals\nC")
        result = soul_mod.update_soul_section("Values", "Updated B")
        assert "## Identity" in result
        assert "A" in result
        assert "Updated B" in result
        assert "## Goals" in result
        assert "C" in result


class TestEnsureSoulExists:
    def test_creates_default(self, soul_dir):
        soul_mod.ensure_soul_exists()
        text = soul_mod.read_soul()
        assert "# Soul of the Traveler" in text

    def test_does_not_overwrite(self, soul_dir):
        soul_mod.write_soul("custom")
        soul_mod.ensure_soul_exists()
        assert soul_mod.read_soul() == "custom"
