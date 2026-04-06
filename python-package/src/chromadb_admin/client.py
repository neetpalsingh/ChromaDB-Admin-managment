"""
ChromaDB Admin Client
Python client for interacting with ChromaDB Admin API
"""

from typing import Optional, Dict, Any, List
import requests


class ChromaDBAdminClient:
    """Client for ChromaDB Admin API"""

    def __init__(self, base_url: str = "http://localhost:3434"):
        """
        Initialize ChromaDB Admin Client
        
        Args:
            base_url: Base URL of the ChromaDB Admin server
        """
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
    
    def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> requests.Response:
        """Make HTTP request to admin API"""
        url = f"{self.base_url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response
    
    def health_check(self) -> Dict[str, Any]:
        """Check ChromaDB health"""
        response = self._request("GET", "/api/v1/healthcheck")
        return response.json()
    
    def list_databases(self, tenant: str = "default_tenant") -> List[str]:
        """List all databases"""
        response = self._request(
            "GET",
            f"/api/v1/tenants/{tenant}/databases"
        )
        return response.json()
    
    def list_collections(
        self,
        tenant: str = "default_tenant",
        database: str = "default_database"
    ) -> List[Dict[str, Any]]:
        """List all collections in a database"""
        response = self._request(
            "GET",
            f"/api/v1/collections",
            params={"tenant": tenant, "database": database}
        )
        return response.json()
    
    def get_collection(
        self,
        collection_id: str,
        tenant: str = "default_tenant",
        database: str = "default_database"
    ) -> Dict[str, Any]:
        """Get collection details"""
        response = self._request(
            "GET",
            f"/api/v1/collections/{collection_id}",
            params={"tenant": tenant, "database": database}
        )
        return response.json()
    
    def query_collection(
        self,
        collection_id: str,
        query_embeddings: List[List[float]],
        n_results: int = 10,
        tenant: str = "default_tenant",
        database: str = "default_database",
        **kwargs
    ) -> Dict[str, Any]:
        """Query a collection"""
        response = self._request(
            "POST",
            f"/api/v1/collections/{collection_id}/query",
            json={
                "query_embeddings": query_embeddings,
                "n_results": n_results,
                **kwargs
            },
            params={"tenant": tenant, "database": database}
        )
        return response.json()
    
    def add_to_collection(
        self,
        collection_id: str,
        embeddings: List[List[float]],
        documents: Optional[List[str]] = None,
        metadatas: Optional[List[Dict[str, Any]]] = None,
        ids: Optional[List[str]] = None,
        tenant: str = "default_tenant",
        database: str = "default_database"
    ) -> Dict[str, Any]:
        """Add items to a collection"""
        response = self._request(
            "POST",
            f"/api/v1/collections/{collection_id}/add",
            json={
                "embeddings": embeddings,
                "documents": documents,
                "metadatas": metadatas,
                "ids": ids
            },
            params={"tenant": tenant, "database": database}
        )
        return response.json()
    
    def delete_from_collection(
        self,
        collection_id: str,
        ids: List[str],
        tenant: str = "default_tenant",
        database: str = "default_database"
    ) -> Dict[str, Any]:
        """Delete items from a collection"""
        response = self._request(
            "POST",
            f"/api/v1/collections/{collection_id}/delete",
            json={"ids": ids},
            params={"tenant": tenant, "database": database}
        )
        return response.json()
    
    def close(self):
        """Close the client session"""
        self.session.close()
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, *args):
        """Context manager exit"""
        self.close()
