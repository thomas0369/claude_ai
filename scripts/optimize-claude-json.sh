#!/bin/bash

# Claude.json Optimization Script
# Safely optimizes ~/.claude.json by removing bloat while preserving essential config
# Created: 2025-11-09

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLAUDE_JSON="$HOME/.claude.json"
BACKUP_DIR="$HOME/.claude/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/claude.json.$TIMESTAMP.backup"

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  Claude.json Optimization Script${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

check_dependencies() {
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Please install it first:"
        echo "  Ubuntu/Debian: sudo apt-get install jq"
        echo "  macOS: brew install jq"
        exit 1
    fi
}

check_file_exists() {
    if [ ! -f "$CLAUDE_JSON" ]; then
        print_error "File not found: $CLAUDE_JSON"
        exit 1
    fi
}

create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_success "Created backup directory: $BACKUP_DIR"
    fi
}

get_file_size() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$1"
    else
        stat -c%s "$1"
    fi
}

format_size() {
    local size=$1
    if [ $size -lt 1024 ]; then
        echo "${size}B"
    elif [ $size -lt 1048576 ]; then
        echo "$((size / 1024))KB"
    else
        echo "$((size / 1048576))MB"
    fi
}

show_current_stats() {
    echo ""
    print_info "Current file statistics:"

    local size=$(get_file_size "$CLAUDE_JSON")
    local lines=$(wc -l < "$CLAUDE_JSON")
    local projects=$(jq '.projects | length' "$CLAUDE_JSON")
    local history_count=$(jq '[.projects[] | .history // [] | length] | add // 0' "$CLAUDE_JSON")

    echo "  File size: $(format_size $size)"
    echo "  Lines: $lines"
    echo "  Projects: $projects"
    echo "  Total history entries: $history_count"
    echo ""
}

create_backup() {
    print_info "Creating backup..."
    cp "$CLAUDE_JSON" "$BACKUP_FILE"
    print_success "Backup created: $BACKUP_FILE"
}

validate_json() {
    if ! jq empty "$1" 2>/dev/null; then
        print_error "Invalid JSON in file: $1"
        return 1
    fi
    return 0
}

optimize_history() {
    local temp_file="$CLAUDE_JSON.tmp"

    print_info "Clearing project history data..."

    jq '.projects |= with_entries(.value.history = [])' "$CLAUDE_JSON" > "$temp_file"

    if validate_json "$temp_file"; then
        mv "$temp_file" "$CLAUDE_JSON"
        print_success "Project history cleared"
    else
        rm -f "$temp_file"
        print_error "Failed to clear history (invalid JSON generated)"
        return 1
    fi
}

remove_stale_projects() {
    local temp_file="$CLAUDE_JSON.tmp"
    local removed_count=0

    print_info "Checking for stale project references..."

    # Create a copy to work with
    cp "$CLAUDE_JSON" "$temp_file"

    # Get list of project paths and remove them one by one
    jq -r '.projects | keys[]' "$CLAUDE_JSON" | while read -r project_path; do
        if [ ! -d "$project_path" ]; then
            print_warning "Found stale project: $project_path"
            # Use a separate temp file for each deletion to avoid jq path escaping issues
            local temp_file2="$CLAUDE_JSON.tmp2"
            jq --arg path "$project_path" 'del(.projects[$path])' "$temp_file" > "$temp_file2"

            if validate_json "$temp_file2"; then
                mv "$temp_file2" "$temp_file"
                ((removed_count++))
            else
                rm -f "$temp_file2"
                print_error "Failed to remove project: $project_path"
            fi
        fi
    done

    if [ $removed_count -gt 0 ]; then
        if validate_json "$temp_file"; then
            mv "$temp_file" "$CLAUDE_JSON"
            print_success "Removed $removed_count stale project(s)"
        else
            rm -f "$temp_file"
            print_error "Failed to remove stale projects (invalid JSON generated)"
            return 1
        fi
    else
        rm -f "$temp_file"
        print_success "No stale projects found"
    fi
}

clear_cached_data() {
    local temp_file="$CLAUDE_JSON.tmp"

    print_info "Clearing cached changelog data..."

    jq 'del(.cachedChangelog)' "$CLAUDE_JSON" > "$temp_file"

    if validate_json "$temp_file"; then
        mv "$temp_file" "$CLAUDE_JSON"
        print_success "Cached data cleared"
    else
        rm -f "$temp_file"
        print_error "Failed to clear cached data (invalid JSON generated)"
        return 1
    fi
}

cleanup_empty_mcp_servers() {
    local temp_file="$CLAUDE_JSON.tmp"

    print_info "Cleaning up empty MCP server configurations..."

    jq 'walk(if type == "object" and has("mcpServers") and (.mcpServers | length == 0) then del(.mcpServers) else . end)' "$CLAUDE_JSON" > "$temp_file"

    if validate_json "$temp_file"; then
        mv "$temp_file" "$CLAUDE_JSON"
        print_success "Empty MCP configurations cleaned"
    else
        rm -f "$temp_file"
        print_error "Failed to clean MCP configurations (invalid JSON generated)"
        return 1
    fi
}

show_final_stats() {
    echo ""
    print_info "Optimization complete! Final statistics:"

    local size=$(get_file_size "$CLAUDE_JSON")
    local lines=$(wc -l < "$CLAUDE_JSON")
    local projects=$(jq '.projects | length' "$CLAUDE_JSON")

    echo "  File size: $(format_size $size)"
    echo "  Lines: $lines"
    echo "  Projects: $projects"
    echo ""
}

calculate_savings() {
    local before_size=$(get_file_size "$BACKUP_FILE")
    local after_size=$(get_file_size "$CLAUDE_JSON")
    local saved=$((before_size - after_size))
    local percent=$((saved * 100 / before_size))

    echo ""
    print_success "Space saved: $(format_size $saved) ($percent% reduction)"
    echo ""
}

show_backup_info() {
    print_info "Backup file location: $BACKUP_FILE"
    print_info "To restore from backup, run:"
    echo "  cp $BACKUP_FILE $CLAUDE_JSON"
    echo ""
}

list_backups() {
    echo ""
    print_info "Available backups in $BACKUP_DIR:"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
        ls -lht "$BACKUP_DIR" | tail -n +2 | while read -r line; do
            echo "  $line"
        done
    else
        echo "  No backups found"
    fi
    echo ""
}

# Main execution
main() {
    print_header

    # Pre-flight checks
    check_dependencies
    check_file_exists
    create_backup_dir
    show_current_stats

    # Confirm before proceeding
    if [ "${1:-}" != "--yes" ] && [ "${1:-}" != "-y" ]; then
        echo -e "${YELLOW}This will optimize your .claude.json file.${NC}"
        echo "The following operations will be performed:"
        echo "  1. Clear all project history data"
        echo "  2. Remove stale project references"
        echo "  3. Clear cached changelog data"
        echo "  4. Clean up empty MCP server configurations"
        echo ""
        read -p "Continue? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "Optimization cancelled"
            exit 0
        fi
    fi

    # Create backup
    create_backup

    # Perform optimizations
    echo ""
    print_info "Starting optimization..."
    echo ""

    optimize_history || { print_error "Optimization failed at history clearing"; exit 1; }
    remove_stale_projects || { print_error "Optimization failed at stale project removal"; exit 1; }
    clear_cached_data || { print_error "Optimization failed at cache clearing"; exit 1; }
    cleanup_empty_mcp_servers || { print_error "Optimization failed at MCP cleanup"; exit 1; }

    # Show results
    show_final_stats
    calculate_savings
    show_backup_info

    print_success "All optimizations completed successfully!"
    echo ""
}

# Handle command-line arguments
case "${1:-}" in
    --list-backups|-l)
        list_backups
        exit 0
        ;;
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  -y, --yes           Skip confirmation prompt"
        echo "  -l, --list-backups  List all available backups"
        echo "  -h, --help          Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0                  Run optimization (with confirmation)"
        echo "  $0 --yes            Run optimization (skip confirmation)"
        echo "  $0 --list-backups   Show all backup files"
        exit 0
        ;;
esac

main "$@"
