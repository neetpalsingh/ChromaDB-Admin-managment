#!/usr/bin/env python3
"""
ChromaDB Admin CLI
Command-line interface for starting the admin dashboard
"""

import argparse
import sys
import os
from pathlib import Path
from .server import start_server

# ASCII Art Banner
BANNER = """
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██████╗██╗  ██╗██████╗  ██████╗ ███╗   ███╗ █████╗      ║
║  ██╔════╝██║  ██║██╔══██╗██╔═══██╗████╗ ████║██╔══██╗     ║
║  ██║     ███████║██████╔╝██║   ██║██╔████╔██║███████║     ║
║  ██║     ██╔══██║██╔══██╗██║   ██║██║╚██╔╝██║██╔══██║     ║
║  ╚██████╗██║  ██║██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║     ║
║   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝     ║
║                                                           ║
║       Admin Management System for ChromaDB                ║
║                    Version 1.0.6                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
"""


def main():
    """Main CLI entry point"""
    print(BANNER)
    
    parser = argparse.ArgumentParser(
        description='ChromaDB Admin Management System',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  chromadb-admin                                       # Start with defaults (port 3434)
  chromadb-admin --port 8080                           # Start on port 8080
  chromadb-admin --chromadb-url http://localhost:8000  # Custom ChromaDB URL
  chromadb-admin --port 5000 --host 0.0.0.0            # Custom port and host
  chromadb-admin --chromadb-url http://chroma:8000 --port 3434

Environment Variables:
  CHROMADB_URL         ChromaDB server URL (default: http://localhost:8000)
  PORT                 Server port (default: 3434)
  HOST                 Server host (default: 0.0.0.0)
        """
    )
    
    parser.add_argument(
        '--chromadb-url',
        type=str,
        default=os.getenv('CHROMADB_URL', 'http://localhost:8000'),
        help='ChromaDB server URL (default: http://localhost:8000)'
    )

    parser.add_argument(
        '--port',
        type=int,
        default=int(os.getenv('PORT', 3434)),
        help='Server port (default: 3434)'
    )

    parser.add_argument(
        '--host',
        type=str,
        default=os.getenv('HOST', '0.0.0.0'),
        help='Server host (default: 0.0.0.0)'
    )
    
    parser.add_argument(
        '--reload',
        action='store_true',
        help='Enable auto-reload for development'
    )
    
    parser.add_argument(
        '--version',
        action='version',
        version='ChromaDB Admin v1.0.6'
    )
    
    args = parser.parse_args()

    print(f"🚀 Starting ChromaDB Admin Dashboard...")
    print(f"📡 Default ChromaDB URL: {args.chromadb_url}")

    # Show appropriate server URL
    if args.host == '0.0.0.0':
        print(f"🌐 Server: http://localhost:{args.port}")
    else:
        print(f"🌐 Server: http://{args.host}:{args.port}")
    print(f"")
    
    try:
        start_server(
            chromadb_url=args.chromadb_url,
            host=args.host,
            port=args.port,
            reload=args.reload
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down ChromaDB Admin...")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
