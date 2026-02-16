import { Link } from 'react-router';
import { Car } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-teal-600 p-4 rounded-full">
              <Car className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Mileage Tracker</h1>
          <p className="text-lg text-gray-600">Track your km's without hassle.</p>
        </div>

        <div className="space-y-3">
          <Link to="/login" className="block">
            <Button className="w-full h-12 text-lg bg-teal-600 hover:bg-teal-700">
              Log in
            </Button>
          </Link>
          <Link to="/signup" className="block">
            <Button variant="outline" className="w-full h-12 text-lg border-teal-600 text-teal-600 hover:bg-teal-50">
              Create account
            </Button>
          </Link>
        </div>

        <div className="text-sm text-gray-500">
          Fast • Simple • Mobile-first
        </div>
      </div>
    </div>
  );
}
