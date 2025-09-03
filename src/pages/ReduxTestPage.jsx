import React from 'react';
import { ReduxTestComponent } from '../components/common/ReduxTestComponent';
import { CustomerMenuRedux } from '../components/Menu/CustomerMenuRedux';
import { OrderManagement } from '../components/Orders/OrderManagement';

export function ReduxTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Redux Integration Test</h1>
        
        <div className="space-y-8">
          {/* Redux Test Component */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Redux Cart Test</h2>
            <ReduxTestComponent />
          </section>
          
          {/* Customer Menu with Redux */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Customer Menu (Redux)</h2>
            <div className="bg-white rounded-lg shadow-sm border">
              <CustomerMenuRedux />
            </div>
          </section>
          
          {/* Order Management with Redux */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Order Management (Redux)</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <OrderManagement />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
