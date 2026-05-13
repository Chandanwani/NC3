#!/usr/bin/env python3
"""
Backend API Testing for Crop Disease Detection System
Tests all API endpoints with real integrations (no mocks)
"""

import requests
import sys
import json
import base64
import time
from datetime import datetime
from typing import Dict, Any, Optional

# Use the public backend URL from frontend .env
BASE_URL = "https://agri-disease-finder.preview.emergentagent.com/api"

class CropDiseaseAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_sessions = []

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def test_welcome_endpoint(self) -> bool:
        """Test GET /api/ returns welcome message"""
        try:
            response = self.session.get(f"{self.base_url}/")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = "message" in data and "Crop Disease Detection" in data["message"]
                details = f"Status: {response.status_code}, Message: {data.get('message', 'N/A')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Welcome Endpoint", success, details, response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Welcome Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_create_session(self, language: str = "en") -> Optional[str]:
        """Test POST /api/chat/sessions creates a new session"""
        try:
            payload = {
                "title": "Test Chat Session",
                "language": language
            }
            response = self.session.post(f"{self.base_url}/chat/sessions", json=payload)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ["id", "title", "language", "created_at", "updated_at"]
                success = all(field in data for field in required_fields)
                session_id = data.get("id")
                if session_id:
                    self.created_sessions.append(session_id)
                details = f"Status: {response.status_code}, Session ID: {session_id}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                session_id = None
            
            self.log_test(f"Create Session ({language})", success, details, response.json() if success else None)
            return session_id if success else None
        except Exception as e:
            self.log_test(f"Create Session ({language})", False, f"Exception: {str(e)}")
            return None

    def test_list_sessions(self) -> bool:
        """Test GET /api/chat/sessions lists all sessions"""
        try:
            response = self.session.get(f"{self.base_url}/chat/sessions")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = isinstance(data, list)
                details = f"Status: {response.status_code}, Sessions count: {len(data)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("List Sessions", success, details, response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("List Sessions", False, f"Exception: {str(e)}")
            return False

    def test_get_messages(self, session_id: str) -> bool:
        """Test GET /api/chat/sessions/{id}/messages returns messages for a session"""
        try:
            response = self.session.get(f"{self.base_url}/chat/sessions/{session_id}/messages")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = isinstance(data, list)
                details = f"Status: {response.status_code}, Messages count: {len(data)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Get Messages", success, details, response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Get Messages", False, f"Exception: {str(e)}")
            return False

    def test_send_text_message(self, session_id: str, language: str = "en") -> bool:
        """Test POST /api/chat/send with text message returns AI response"""
        try:
            test_message = "What are common rice diseases?" if language == "en" else "धान के सामान्य रोग क्या हैं?"
            payload = {
                "session_id": session_id,
                "text": test_message,
                "language": language
            }
            
            print(f"🔄 Sending text message (may take 5-15 seconds for GPT-4o response)...")
            response = self.session.post(f"{self.base_url}/chat/send", json=payload, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ["id", "session_id", "role", "text", "created_at"]
                success = all(field in data for field in required_fields) and data["role"] == "assistant"
                details = f"Status: {response.status_code}, AI Response length: {len(data.get('text', ''))}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test(f"Send Text Message ({language})", success, details, response.json() if success else None)
            return success
        except Exception as e:
            self.log_test(f"Send Text Message ({language})", False, f"Exception: {str(e)}")
            return False

    def create_test_image_base64(self) -> str:
        """Create a simple test image in base64 format (JPEG)"""
        # Create a simple 100x100 RGB image with some pattern (not solid color)
        from PIL import Image
        import io
        
        # Create image with gradient pattern
        img = Image.new('RGB', (100, 100))
        pixels = img.load()
        
        for i in range(100):
            for j in range(100):
                # Create a simple gradient pattern
                r = int(255 * (i / 100))
                g = int(255 * (j / 100))
                b = int(255 * ((i + j) / 200))
                pixels[i, j] = (r, g, b)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        img_bytes = buffer.getvalue()
        return base64.b64encode(img_bytes).decode('utf-8')

    def test_send_image_message(self, session_id: str, language: str = "en") -> bool:
        """Test POST /api/chat/send with image (base64 JPEG) + text returns AI analysis"""
        try:
            # Try to create test image, fallback to simple pattern if PIL not available
            try:
                image_base64 = self.create_test_image_base64()
            except ImportError:
                # Fallback: create a minimal valid JPEG base64 (1x1 pixel)
                # This is a valid 1x1 red pixel JPEG
                image_base64 = "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A"
            
            test_message = "Please analyze this crop image for diseases" if language == "en" else "कृपया इस फसल की तस्वीर का रोग विश्लेषण करें"
            payload = {
                "session_id": session_id,
                "text": test_message,
                "image_base64": image_base64,
                "image_mime": "image/jpeg",
                "language": language
            }
            
            print(f"🔄 Sending image message (may take 5-15 seconds for GPT-4o analysis)...")
            response = self.session.post(f"{self.base_url}/chat/send", json=payload, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ["id", "session_id", "role", "text", "created_at"]
                success = all(field in data for field in required_fields) and data["role"] == "assistant"
                details = f"Status: {response.status_code}, AI Response length: {len(data.get('text', ''))}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test(f"Send Image Message ({language})", success, details, response.json() if success else None)
            return success
        except Exception as e:
            self.log_test(f"Send Image Message ({language})", False, f"Exception: {str(e)}")
            return False

    def test_update_session_language(self, session_id: str, new_language: str = "hi") -> bool:
        """Test PATCH /api/chat/sessions/{id}/language updates session language"""
        try:
            response = self.session.patch(f"{self.base_url}/chat/sessions/{session_id}/language?language={new_language}")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = data.get("status") == "updated"
                details = f"Status: {response.status_code}, Update status: {data.get('status')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test(f"Update Session Language ({new_language})", success, details, response.json() if success else None)
            return success
        except Exception as e:
            self.log_test(f"Update Session Language ({new_language})", False, f"Exception: {str(e)}")
            return False

    def test_delete_session(self, session_id: str) -> bool:
        """Test DELETE /api/chat/sessions/{id} deletes a session"""
        try:
            response = self.session.delete(f"{self.base_url}/chat/sessions/{session_id}")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = data.get("status") == "deleted"
                details = f"Status: {response.status_code}, Delete status: {data.get('status')}"
                # Remove from our tracking list
                if session_id in self.created_sessions:
                    self.created_sessions.remove(session_id)
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Delete Session", success, details, response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Delete Session", False, f"Exception: {str(e)}")
            return False

    def test_list_diseases(self) -> bool:
        """Test GET /api/diseases returns 10 diseases"""
        try:
            response = self.session.get(f"{self.base_url}/diseases")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = isinstance(data, list) and len(data) == 10
                # Check if each disease has required fields
                if success and data:
                    required_fields = ["id", "name_en", "name_hi", "crop", "symptoms_en", "symptoms_hi", "precautions_en", "precautions_hi", "treatment_en", "treatment_hi", "soil_impact_en", "soil_impact_hi"]
                    success = all(all(field in disease for field in required_fields) for disease in data)
                details = f"Status: {response.status_code}, Diseases count: {len(data) if isinstance(data, list) else 'N/A'}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("List Diseases", success, details, response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("List Diseases", False, f"Exception: {str(e)}")
            return False

    def test_search_diseases(self, query: str) -> bool:
        """Test GET /api/diseases/search?q={query} returns matching diseases"""
        try:
            response = self.session.get(f"{self.base_url}/diseases/search?q={query}")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = isinstance(data, list)
                # Check if results contain the query term (case insensitive)
                if success and data:
                    query_lower = query.lower()
                    for disease in data:
                        searchable_text = f"{disease.get('name_en', '')} {disease.get('name_hi', '')} {disease.get('crop', '')} {disease.get('symptoms_en', '')} {disease.get('symptoms_hi', '')}".lower()
                        if any(word in searchable_text for word in query_lower.split() if len(word) > 2):
                            break
                    else:
                        success = len(data) == 0  # Empty results are OK if no matches
                details = f"Status: {response.status_code}, Query: '{query}', Results: {len(data) if isinstance(data, list) else 'N/A'}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test(f"Search Diseases ('{query}')", success, details, response.json() if success else None)
            return success
        except Exception as e:
            self.log_test(f"Search Diseases ('{query}')", False, f"Exception: {str(e)}")
            return False

    def test_export_session(self, session_id: str) -> bool:
        """Test GET /api/chat/sessions/{id}/export returns markdown text"""
        try:
            response = self.session.get(f"{self.base_url}/chat/sessions/{session_id}/export")
            success = response.status_code == 200
            
            if success:
                # Check if response is text/markdown
                content_type = response.headers.get('content-type', '')
                success = 'text/markdown' in content_type or 'text/plain' in content_type
                text_content = response.text
                # Check if it contains markdown-like content
                if success:
                    success = len(text_content) > 0 and ('###' in text_content or '#' in text_content)
                details = f"Status: {response.status_code}, Content-Type: {content_type}, Length: {len(text_content)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Export Session", success, details, response.text[:500] if success else None)
            return success
        except Exception as e:
            self.log_test("Export Session", False, f"Exception: {str(e)}")
            return False

    def test_enhanced_treatment_response_english(self, session_id: str) -> bool:
        """Test enhanced treatment response with dosage per acre and Google links (English)"""
        try:
            test_message = "My tomato has late blight, give treatment with dosage per acre and Google links to buy"
            payload = {
                "session_id": session_id,
                "text": test_message,
                "language": "en"
            }
            
            print(f"🔄 Testing enhanced treatment response (may take 5-20 seconds for detailed GPT-4o response)...")
            response = self.session.post(f"{self.base_url}/chat/send", json=payload, timeout=35)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                ai_response = data.get('text', '')
                
                # Check for required enhanced features
                has_dosage_info = any(keyword in ai_response.lower() for keyword in ['per acre', 'dosage', 'spray', 'liter'])
                has_google_links = 'google.com/search' in ai_response.lower()
                has_treatment_details = any(keyword in ai_response.lower() for keyword in ['mancozeb', 'fungicide', 'treatment', 'spray'])
                
                success = has_dosage_info and has_google_links and has_treatment_details
                details = f"Status: {response.status_code}, Dosage info: {has_dosage_info}, Google links: {has_google_links}, Treatment details: {has_treatment_details}, Response length: {len(ai_response)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Enhanced Treatment Response (EN)", success, details, response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Enhanced Treatment Response (EN)", False, f"Exception: {str(e)}")
            return False

    def test_enhanced_treatment_response_hindi(self, session_id: str) -> bool:
        """Test enhanced treatment response with dosage per acre and Google links (Hindi)"""
        try:
            test_message = "मेरे टमाटर में अगेती अंगमारी है, प्रति एकड़ खुराक और खरीदने के लिए Google लिंक के साथ उपचार दें"
            payload = {
                "session_id": session_id,
                "text": test_message,
                "language": "hi"
            }
            
            print(f"🔄 Testing enhanced treatment response in Hindi (may take 5-20 seconds for detailed GPT-4o response)...")
            response = self.session.post(f"{self.base_url}/chat/send", json=payload, timeout=35)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                ai_response = data.get('text', '')
                
                # Check for required enhanced features (both Hindi and English terms)
                has_dosage_info = any(keyword in ai_response.lower() for keyword in ['एकड़', 'खुराक', 'छिड़काव', 'लीटर', 'per acre', 'dosage', 'spray'])
                has_google_links = 'google.com/search' in ai_response.lower()
                has_treatment_details = any(keyword in ai_response.lower() for keyword in ['मैंकोज़ेब', 'फफूंदनाशक', 'उपचार', 'mancozeb', 'fungicide', 'treatment'])
                
                success = has_dosage_info and has_google_links and has_treatment_details
                details = f"Status: {response.status_code}, Dosage info: {has_dosage_info}, Google links: {has_google_links}, Treatment details: {has_treatment_details}, Response length: {len(ai_response)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Enhanced Treatment Response (HI)", success, details, response.json() if success else None)
            return success
        except Exception as e:
            self.log_test("Enhanced Treatment Response (HI)", False, f"Exception: {str(e)}")
            return False

    def cleanup_sessions(self):
        """Clean up any remaining test sessions"""
        for session_id in self.created_sessions[:]:
            try:
                self.session.delete(f"{self.base_url}/chat/sessions/{session_id}")
                self.created_sessions.remove(session_id)
            except:
                pass

    def run_all_tests(self):
        """Run comprehensive backend API tests"""
        print(f"🚀 Starting Backend API Tests for Crop Disease Detection System")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 80)
        
        # Test 1: Welcome endpoint
        self.test_welcome_endpoint()
        
        # Test 2: Disease Library - List all diseases
        self.test_list_diseases()
        
        # Test 3: Disease Library - Search diseases (rice)
        self.test_search_diseases("rice")
        
        # Test 4: Disease Library - Search diseases (wheat)
        self.test_search_diseases("wheat")
        
        # Test 5: Create session (English)
        session_id_en = self.test_create_session("en")
        if not session_id_en:
            print("❌ Cannot continue without session creation")
            return False
        
        # Test 6: List sessions
        self.test_list_sessions()
        
        # Test 7: Get messages (should be empty initially)
        self.test_get_messages(session_id_en)
        
        # Test 8: Send text message (English)
        self.test_send_text_message(session_id_en, "en")
        
        # Test 9: Send image message (English)
        self.test_send_image_message(session_id_en, "en")
        
        # Test 10: Export session (should have messages now)
        self.test_export_session(session_id_en)
        
        # Test 11: Enhanced treatment response (English) - NEW TEST
        self.test_enhanced_treatment_response_english(session_id_en)
        
        # Test 12: Update session language
        self.test_update_session_language(session_id_en, "hi")
        
        # Test 13: Enhanced treatment response (Hindi) - NEW TEST
        self.test_enhanced_treatment_response_hindi(session_id_en)
        
        # Test 14: Send text message (Hindi)
        self.test_send_text_message(session_id_en, "hi")
        
        # Test 15: Create another session (Hindi)
        session_id_hi = self.test_create_session("hi")
        
        # Test 16: Send image message (Hindi)
        if session_id_hi:
            self.test_send_image_message(session_id_hi, "hi")
        
        # Test 17: Delete session
        if session_id_hi:
            self.test_delete_session(session_id_hi)
        
        # Cleanup remaining sessions
        self.cleanup_sessions()
        
        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print(f"📊 Backend API Test Summary")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed < self.tests_run:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = CropDiseaseAPITester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        # Save detailed results
        with open("/app/backend_test_results.json", "w") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "base_url": BASE_URL,
                "summary": {
                    "tests_run": tester.tests_run,
                    "tests_passed": tester.tests_passed,
                    "success_rate": tester.tests_passed/tester.tests_run*100 if tester.tests_run > 0 else 0
                },
                "detailed_results": tester.test_results
            }, f, indent=2)
        
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
        tester.cleanup_sessions()
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        tester.cleanup_sessions()
        return 1

if __name__ == "__main__":
    sys.exit(main())