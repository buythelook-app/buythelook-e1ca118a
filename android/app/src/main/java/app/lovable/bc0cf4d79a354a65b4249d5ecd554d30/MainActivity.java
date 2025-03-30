package app.lovable.bc0cf4d79a354a65b4249d5ecd554d30;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "BuyTheLookApp";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Enable WebView debugging
        WebView.setWebContentsDebuggingEnabled(true);
        
        Log.d(TAG, "MainActivity onCreate started");
        
        try {
            super.onCreate(savedInstanceState);
            Log.d(TAG, "Capacitor Bridge initialized successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error initializing Capacitor: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void onStart() {
        super.onStart();
        Log.d(TAG, "MainActivity onStart called");
    }
    
    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "MainActivity onResume called");
    }
}
