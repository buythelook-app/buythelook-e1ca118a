package app.lovable.bc0cf4d79a354a65b4249d5ecd554d30;

import android.content.Intent;
import android.net.Uri;
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
            
            // No need to handle intent here - super.onCreate already does this
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
    
    @Override
    public void onNewIntent(Intent intent) {
        // Log intent data for debugging
        if (intent != null && intent.getData() != null) {
            Uri uri = intent.getData();
            Log.d(TAG, "Received intent with URI: " + uri.toString());
            
            // Log additional details about the intent
            if (uri.getScheme() != null) {
                Log.d(TAG, "URI scheme: " + uri.getScheme());
            }
            if (uri.getHost() != null) {
                Log.d(TAG, "URI host: " + uri.getHost());
            }
            if (uri.getPath() != null) {
                Log.d(TAG, "URI path: " + uri.getPath());
            }
            if (uri.getQuery() != null) {
                Log.d(TAG, "URI query: " + uri.getQuery());
            }
        }
        
        // Let the parent BridgeActivity handle the intent properly
        // This will automatically send the appUrlOpen event to JS
        super.onNewIntent(intent);
        Log.d(TAG, "Passed intent to parent BridgeActivity");
    }
}
