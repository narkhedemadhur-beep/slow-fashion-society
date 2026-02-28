#!/usr/bin/env python3
import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class SlowFashionAPITester:
    def __init__(self):
        self.base_url = "https://vintage-collective.preview.emergentagent.com/api"
        self.token = None
        self.session_cookies = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_user = {
            "email": "test@slowfashion.com", 
            "password": "testpass123",
            "name": "Test User"
        }
        
        self.test_product = {
            "name": "Vintage Denim Jacket",
            "description": "A classic vintage denim jacket in excellent condition",
            "category": "Outerwear", 
            "price": 45.99,
            "images": ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0"],
            "sizes": ["S", "M", "L"],
            "stock": 3,
            "condition": "Excellent",
            "is_featured": True
        }

    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name}: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def make_request(self, method: str, endpoint: str, data: Dict = None, auth_required: bool = False) -> tuple:
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if auth_required and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, cookies=self.session_cookies, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, cookies=self.session_cookies, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, cookies=self.session_cookies, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, cookies=self.session_cookies, timeout=10)
            
            return response.status_code, response.json() if response.content else {}
        except requests.exceptions.RequestException as e:
            return 0, {"error": str(e)}
        except json.JSONDecodeError:
            return response.status_code, {"error": "Invalid JSON response"}

    def test_signup(self):
        """Test user signup"""
        status, data = self.make_request('POST', 'auth/signup', self.test_user)
        
        if status == 201 or status == 200:
            if 'token' in data and 'user' in data:
                self.token = data['token']
                self.user_id = data['user']['user_id']
                self.log_test("User Signup", True, f"User created with ID: {self.user_id}")
                return True
            else:
                self.log_test("User Signup", False, "Missing token or user in response")
        elif status == 400 and "already registered" in str(data):
            self.log_test("User Signup", True, "User already exists - proceeding with login")
            return True
        else:
            self.log_test("User Signup", False, f"Status {status}: {data}")
        return False

    def test_login(self):
        """Test user login"""
        login_data = {"email": self.test_user["email"], "password": self.test_user["password"]}
        status, data = self.make_request('POST', 'auth/login', login_data)
        
        if status == 200:
            if 'token' in data and 'user' in data:
                self.token = data['token']
                self.user_id = data['user']['user_id']
                self.log_test("User Login", True, f"Logged in successfully")
                return True
            else:
                self.log_test("User Login", False, "Missing token or user in response")
        else:
            self.log_test("User Login", False, f"Status {status}: {data}")
        return False

    def test_get_me(self):
        """Test get current user endpoint"""
        status, data = self.make_request('GET', 'auth/me', auth_required=True)
        
        if status == 200:
            if 'user_id' in data and data['user_id'] == self.user_id:
                self.log_test("Get Current User", True)
                return True
            else:
                self.log_test("Get Current User", False, "User data mismatch")
        else:
            self.log_test("Get Current User", False, f"Status {status}: {data}")
        return False

    def test_categories(self):
        """Test get categories"""
        status, data = self.make_request('GET', 'categories')
        
        if status == 200:
            if isinstance(data, list):
                self.log_test("Get Categories", True, f"Retrieved {len(data)} categories")
                return True
            else:
                self.log_test("Get Categories", False, "Response not a list")
        else:
            self.log_test("Get Categories", False, f"Status {status}: {data}")
        return False

    def test_create_product(self):
        """Test creating a product"""
        status, data = self.make_request('POST', 'products', self.test_product, auth_required=True)
        
        if status == 200 or status == 201:
            if 'product_id' in data:
                self.created_product_id = data['product_id']
                self.log_test("Create Product", True, f"Product created with ID: {self.created_product_id}")
                return True
            else:
                self.log_test("Create Product", False, "Missing product_id in response")
        else:
            self.log_test("Create Product", False, f"Status {status}: {data}")
        return False

    def test_get_products(self):
        """Test get all products"""
        status, data = self.make_request('GET', 'products')
        
        if status == 200:
            if isinstance(data, list):
                self.log_test("Get Products", True, f"Retrieved {len(data)} products")
                return True
            else:
                self.log_test("Get Products", False, "Response not a list")
        else:
            self.log_test("Get Products", False, f"Status {status}: {data}")
        return False

    def test_get_featured_products(self):
        """Test get featured products"""
        status, data = self.make_request('GET', 'products/featured')
        
        if status == 200:
            if isinstance(data, list):
                self.log_test("Get Featured Products", True, f"Retrieved {len(data)} featured products")
                return True
            else:
                self.log_test("Get Featured Products", False, "Response not a list")
        else:
            self.log_test("Get Featured Products", False, f"Status {status}: {data}")
        return False

    def test_get_single_product(self):
        """Test get single product"""
        if hasattr(self, 'created_product_id'):
            status, data = self.make_request('GET', f'products/{self.created_product_id}')
            
            if status == 200:
                if 'product_id' in data and data['product_id'] == self.created_product_id:
                    self.log_test("Get Single Product", True)
                    return True
                else:
                    self.log_test("Get Single Product", False, "Product data mismatch")
            else:
                self.log_test("Get Single Product", False, f"Status {status}: {data}")
        else:
            self.log_test("Get Single Product", False, "No product created to test with")
        return False

    def test_cart_operations(self):
        """Test cart add/get/remove operations"""
        if not hasattr(self, 'created_product_id'):
            self.log_test("Cart Operations", False, "No product to add to cart")
            return False

        # Add to cart
        cart_item = {"product_id": self.created_product_id, "quantity": 1}
        status, data = self.make_request('POST', 'cart/add', cart_item, auth_required=True)
        
        if status != 200:
            self.log_test("Add to Cart", False, f"Status {status}: {data}")
            return False
        self.log_test("Add to Cart", True)

        # Get cart
        status, data = self.make_request('GET', 'cart', auth_required=True)
        if status != 200:
            self.log_test("Get Cart", False, f"Status {status}: {data}")
            return False
        
        cart_has_item = False
        if 'items' in data:
            for item in data['items']:
                if item['product_id'] == self.created_product_id:
                    cart_has_item = True
                    break
        
        if cart_has_item:
            self.log_test("Get Cart", True, "Cart contains added product")
        else:
            self.log_test("Get Cart", False, "Cart missing added product")

        # Remove from cart
        status, data = self.make_request('POST', 'cart/remove', cart_item, auth_required=True)
        if status == 200:
            self.log_test("Remove from Cart", True)
            return True
        else:
            self.log_test("Remove from Cart", False, f"Status {status}: {data}")
        return False

    def test_wishlist_operations(self):
        """Test wishlist add/get/remove operations"""
        if not hasattr(self, 'created_product_id'):
            self.log_test("Wishlist Operations", False, "No product to add to wishlist")
            return False

        # Add to wishlist
        status, data = self.make_request('POST', f'wishlist/add/{self.created_product_id}', auth_required=True)
        if status != 200:
            self.log_test("Add to Wishlist", False, f"Status {status}: {data}")
            return False
        self.log_test("Add to Wishlist", True)

        # Get wishlist
        status, data = self.make_request('GET', 'wishlist', auth_required=True)
        if status != 200:
            self.log_test("Get Wishlist", False, f"Status {status}: {data}")
            return False
        
        wishlist_has_item = False
        if 'product_ids' in data and self.created_product_id in data['product_ids']:
            wishlist_has_item = True
        
        if wishlist_has_item:
            self.log_test("Get Wishlist", True, "Wishlist contains added product")
        else:
            self.log_test("Get Wishlist", False, "Wishlist missing added product")

        # Remove from wishlist
        status, data = self.make_request('POST', f'wishlist/remove/{self.created_product_id}', auth_required=True)
        if status == 200:
            self.log_test("Remove from Wishlist", True)
            return True
        else:
            self.log_test("Remove from Wishlist", False, f"Status {status}: {data}")
        return False

    def test_create_order(self):
        """Test order creation"""
        if not hasattr(self, 'created_product_id'):
            self.log_test("Create Order", False, "No product to create order with")
            return False

        order_data = {
            "items": [{
                "product_id": self.created_product_id,
                "name": self.test_product["name"],
                "price": self.test_product["price"],
                "quantity": 1,
                "image": self.test_product["images"][0]
            }],
            "total": self.test_product["price"],
            "payment_method": "cod",
            "shipping_address": {
                "full_name": "Test User",
                "address": "123 Test St",
                "city": "Test City",
                "state": "TS",
                "zip_code": "12345",
                "phone": "555-0123"
            }
        }

        status, data = self.make_request('POST', 'orders', order_data, auth_required=True)
        
        if status == 200 or status == 201:
            if 'order_id' in data:
                self.created_order_id = data['order_id']
                self.log_test("Create Order", True, f"Order created with ID: {self.created_order_id}")
                return True
            else:
                self.log_test("Create Order", False, "Missing order_id in response")
        else:
            self.log_test("Create Order", False, f"Status {status}: {data}")
        return False

    def test_get_orders(self):
        """Test get user orders"""
        status, data = self.make_request('GET', 'orders', auth_required=True)
        
        if status == 200:
            if isinstance(data, list):
                self.log_test("Get Orders", True, f"Retrieved {len(data)} orders")
                return True
            else:
                self.log_test("Get Orders", False, "Response not a list")
        else:
            self.log_test("Get Orders", False, f"Status {status}: {data}")
        return False

    def test_create_review(self):
        """Test creating a review"""
        if not hasattr(self, 'created_product_id'):
            self.log_test("Create Review", False, "No product to review")
            return False

        review_data = {
            "product_id": self.created_product_id,
            "rating": 5,
            "comment": "Great product, exactly as described!"
        }

        status, data = self.make_request('POST', 'reviews', review_data, auth_required=True)
        
        if status == 200 or status == 201:
            if 'review_id' in data:
                self.log_test("Create Review", True, f"Review created with ID: {data['review_id']}")
                return True
            else:
                self.log_test("Create Review", False, "Missing review_id in response")
        else:
            self.log_test("Create Review", False, f"Status {status}: {data}")
        return False

    def test_get_reviews(self):
        """Test get product reviews"""
        if hasattr(self, 'created_product_id'):
            status, data = self.make_request('GET', f'reviews/{self.created_product_id}')
            
            if status == 200:
                if isinstance(data, list):
                    self.log_test("Get Reviews", True, f"Retrieved {len(data)} reviews")
                    return True
                else:
                    self.log_test("Get Reviews", False, "Response not a list")
            else:
                self.log_test("Get Reviews", False, f"Status {status}: {data}")
        else:
            self.log_test("Get Reviews", False, "No product to get reviews for")
        return False

    def test_submit_feedback(self):
        """Test feedback submission"""
        feedback_data = {
            "message": "Great website! Love the sustainable fashion concept.",
            "email": "feedback@test.com"
        }

        status, data = self.make_request('POST', 'feedback', feedback_data)
        
        if status == 200:
            if 'message' in data and 'successfully' in data['message'].lower():
                self.log_test("Submit Feedback", True)
                return True
            else:
                self.log_test("Submit Feedback", False, "Unexpected response format")
        else:
            self.log_test("Submit Feedback", False, f"Status {status}: {data}")
        return False

    def test_newsletter_subscription(self):
        """Test newsletter subscription"""
        newsletter_data = {"email": "newsletter@test.com"}
        
        status, data = self.make_request('POST', 'newsletter/subscribe', newsletter_data)
        
        if status == 200:
            if 'message' in data:
                self.log_test("Newsletter Subscription", True)
                return True
            else:
                self.log_test("Newsletter Subscription", False, "Unexpected response format")
        else:
            self.log_test("Newsletter Subscription", False, f"Status {status}: {data}")
        return False

    def test_admin_get_feedback(self):
        """Test getting all feedback (admin endpoint)"""
        status, data = self.make_request('GET', 'feedback', auth_required=True)
        
        if status == 200:
            if isinstance(data, list):
                self.log_test("Get All Feedback (Admin)", True, f"Retrieved {len(data)} feedback items")
                return True
            else:
                self.log_test("Get All Feedback (Admin)", False, "Response not a list")
        else:
            self.log_test("Get All Feedback (Admin)", False, f"Status {status}: {data}")
        return False

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting Slow Fashion Society API Tests")
        print("=" * 50)
        
        # Authentication Tests
        print("\n📝 Authentication Tests:")
        if self.test_signup():
            pass  # Either created new user or user already exists
        
        if not self.test_login():
            print("❌ Login failed - cannot proceed with auth-required tests")
            return False
        
        self.test_get_me()
        
        # Public API Tests
        print("\n🛍️  Public API Tests:")
        self.test_categories()
        self.test_get_products()
        self.test_get_featured_products()
        
        # Product Management Tests
        print("\n📦 Product Management Tests:")
        self.test_create_product()
        self.test_get_single_product()
        
        # Cart & Wishlist Tests
        print("\n🛒 Cart & Wishlist Tests:")
        self.test_cart_operations()
        self.test_wishlist_operations()
        
        # Order Tests
        print("\n📋 Order Tests:")
        self.test_create_order()
        self.test_get_orders()
        
        # Review Tests
        print("\n⭐ Review Tests:")
        self.test_create_review()
        self.test_get_reviews()
        
        # Feedback & Newsletter Tests
        print("\n💌 Feedback & Newsletter Tests:")
        self.test_submit_feedback()
        self.test_newsletter_subscription()
        self.test_admin_get_feedback()
        
        # Summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        print(f"🎯 Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = SlowFashionAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': tester.tests_passed/tester.tests_run if tester.tests_run > 0 else 0,
            'test_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())