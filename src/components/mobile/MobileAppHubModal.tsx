'use client';

/**
 * Mobile App pop-up: how to install the portal on a phone and how to build an Android APK (Android Studio / Capacitor guide).
 */
import React, { useState } from 'react';
import { useCollege } from '../../context/CollegeContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Layers,
  Code2,
  FileCode,
  Sparkles,
  QrCode,
  Shield,
  Wifi,
  Play,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Info,
  Laptop,
} from 'lucide-react';

interface MobileAppHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppHubModal: React.FC<MobileAppHubModalProps> = ({ isOpen, onClose }) => {
  const { language } = useCollege();
  const { isInstallable, isInstalled, isIOS, isAndroid, installApp } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'pwa' | 'android_studio' | 'step_by_step' | 'capacitor' | 'simulator'>('android_studio');
  const [selectedCodeFile, setSelectedCodeFile] = useState<'kotlin' | 'manifest' | 'gradle' | 'layout' | 'network' | 'java'>('kotlin');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [installSuccess, setInstallSuccess] = useState(false);

  // App production / dev URL
  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-lgzuvaxmfjetc5o7hbpwox-472823229884.asia-southeast1.run.app';

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePWAInstall = async () => {
    const res = await installApp();
    if (res) {
      setInstallSuccess(true);
    }
  };

  // Ready-to-use Android Studio code files
  const kotlinMainActivityCode = `package com.ukpolytechnic.portal

import android.annotation.SuppressLint
import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar

    // File chooser callback for uploading resumes, assignments and photos
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    // Register Activity Result for File Chooser (Android 11+ compatible)
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (fileUploadCallback == null) return@registerForActivityResult
        val results: Array<Uri>? = if (result.resultCode == RESULT_OK && result.data != null) {
            val clipData = result.data?.clipData
            if (clipData != null) {
                Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
            } else {
                result.data?.data?.let { arrayOf(it) }
            }
        } else {
            null
        }
        fileUploadCallback?.onReceiveValue(results)
        fileUploadCallback = null
    }

    // Portal Web URL (Replace with your live deployed URL or local IP for testing)
    private val PORTAL_URL = "${currentAppUrl}"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        progressBar = findViewById(R.id.progressBar)

        setupWebView()
        setupSwipeRefresh()
        setupBackNavigation()

        // Load the College Portal
        webView.loadUrl(PORTAL_URL)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val webSettings = webView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true
        webSettings.databaseEnabled = true
        webSettings.allowFileAccess = true
        webSettings.allowContentAccess = true
        webSettings.loadWithOverviewMode = true
        webSettings.useWideViewPort = true
        webSettings.setSupportZoom(true)
        webSettings.builtInZoomControls = false
        webSettings.cacheMode = WebSettings.LOAD_DEFAULT

        // Enable Cookies
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)

        // WebViewClient to keep links inside app
        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefresh.isRefreshing = false
            }

            override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    Toast.makeText(this@MainActivity, "Network error. Pull down to retry.", Toast.LENGTH_SHORT).show()
                }
            }
        }

        // WebChromeClient for File Upload (Resumes/Documents) & Progress
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                if (newProgress == 100) {
                    progressBar.visibility = View.GONE
                }
            }

            // Handle file upload input from web page
            override fun onShowFileChooser(
                mWebView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }
                try {
                    fileChooserLauncher.launch(intent)
                } catch (e: Exception) {
                    fileUploadCallback = null
                    Toast.makeText(this@MainActivity, "Cannot open file picker", Toast.LENGTH_SHORT).show()
                    return false
                }
                return true
            }
        }

        // Download Listener for Excel sheets and PDF reports
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, _ ->
            val request = DownloadManager.Request(Uri.parse(url)).apply {
                setMimeType(mimetype)
                addRequestHeader("User-Agent", userAgent)
                setDescription("Downloading file from UGIP Tanakpur Portal")
                setTitle(URLUtil.guessFileName(url, contentDisposition, mimetype))
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS,
                    URLUtil.guessFileName(url, contentDisposition, mimetype)
                )
            }
            val dm = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            dm.enqueue(request)
            Toast.makeText(this, "Downloading file to Downloads folder...", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupSwipeRefresh() {
        swipeRefresh.setColorSchemeResources(
            android.R.color.holo_blue_bright,
            android.R.color.holo_green_light,
            android.R.color.holo_orange_light
        )
        swipeRefresh.setOnRefreshListener {
            webView.reload()
        }
    }

    private fun setupBackNavigation() {
        // Handle native Android hardware back button
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }
}`;

  const manifestXmlCode = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.ukpolytechnic.portal">

    <!-- Essential Android Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="UGIP Tanakpur Portal"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.AppCompat.Light.NoActionBar"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true"
        android:networkSecurityConfig="@xml/network_security_config"
        tools:targetApi="34">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>`;

  const buildGradleCode = `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.ukpolytechnic.portal"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.ukpolytechnic.portal"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    implementation("androidx.webkit:webkit:1.10.0")
}`;

  const activityMainLayoutCode = `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#13294b"
    tools:context=".MainActivity">

    <!-- Thin Top Progress Bar for Page Load -->
    <ProgressBar
        android:id="@+id/progressBar"
        style="?android:attr/progressBarStyleHorizontal"
        android:layout_width="match_parent"
        android:layout_height="4dp"
        android:max="100"
        android:progressTint="#d8ad45"
        android:visibility="gone"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

    <!-- Swipe Refresh Layout for Pull-to-Refresh -->
    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefresh"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintTop_toBottomOf="@id/progressBar"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">

        <!-- Main WebView displaying UGIP Tanakpur Portal -->
        <WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />

    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

</androidx.constraintlayout.widget.ConstraintLayout>`;

  const networkSecurityConfigCode = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allows cleartext traffic for local dev server testing (10.0.2.2 emulator and local IP) -->
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.1.1</domain>
    </domain-config>
</network-security-config>`;

  const javaMainActivityCode = `package com.ukpolytechnic.portal;

import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private ValueCallback<Uri[]> fileUploadCallback;

    private static final String PORTAL_URL = "${currentAppUrl}";

    private final ActivityResultLauncher<Intent> fileChooserLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                if (fileUploadCallback == null) return;
                Uri[] results = null;
                if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                    if (result.getData().getClipData() != null) {
                        int count = result.getData().getClipData().getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = result.getData().getClipData().getItemAt(i).getUri();
                        }
                    } else if (result.getData().getData() != null) {
                        results = new Uri[]{result.getData().getData()};
                    }
                }
                fileUploadCallback.onReceiveValue(results);
                fileUploadCallback = null;
            }
    );

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        progressBar = findViewById(R.id.progressBar);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
                swipeRefresh.setRefreshing(false);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                progressBar.setVisibility(newProgress == 100 ? View.GONE : View.VISIBLE);
            }

            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileUploadCallback != null) fileUploadCallback.onReceiveValue(null);
                fileUploadCallback = callback;
                Intent intent = params != null ? params.createIntent() : new Intent(Intent.ACTION_GET_CONTENT).setType("*/*");
                fileChooserLauncher.launch(intent);
                return true;
            }
        });

        swipeRefresh.setOnRefreshListener(() -> webView.reload());

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });

        webView.loadUrl(PORTAL_URL);
    }
}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Banner */}
        <div className="p-4 sm:p-6 bg-[#13294b] text-white flex items-center justify-between border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {language === 'hi'
                    ? 'मोबाइल ऐप सेंटर व एंड्रॉइड स्टूडियो गाइड'
                    : 'Mobile App Center & Android Studio Guide'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gold-300 text-[#13294b] tracking-wider">
                  APK READY
                </span>
              </div>
              <p className="text-xs text-cyan-200/90 font-medium">
                {language === 'hi'
                  ? 'उत्तराखंड राजकीय पॉलीटेक्निक संस्थान, टनकपुर पोर्टल को मोबाइल ऐप में बदलें और Android Studio में चलाएं'
                  : 'Convert portal to mobile app and run in Android Studio with Kotlin/WebView or Capacitor'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-black"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('android_studio')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'android_studio'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4 text-cyan-200" />
            <span>{language === 'hi' ? '1. Android Studio कोड' : '1. Android Studio Code'}</span>
          </button>

          <button
            onClick={() => setActiveTab('step_by_step')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'step_by_step'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>{language === 'hi' ? '2. कैसे चलाएं (Full Guide)' : '2. How to Run (Guide)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'pwa'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-300" />
            <span>{language === 'hi' ? '3. डायरेक्ट PWA ऐप' : '3. Instant PWA App'}</span>
          </button>

          <button
            onClick={() => setActiveTab('capacitor')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'capacitor'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4 text-purple-300" />
            <span>{language === 'hi' ? '4. Capacitor CLI (1-Click)' : '4. Capacitor CLI'}</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Laptop className="w-4 h-4 text-rose-300" />
            <span>{language === 'hi' ? '5. फोन सिमुलेटर' : '5. Phone Simulator'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-800 dark:text-slate-200">
          {/* TAB 1: ANDROID STUDIO CODE */}
          {activeTab === 'android_studio' && (
            <div className="space-y-6">
              {/* Highlight Info Box */}
              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-600 text-white shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-cyan-900 dark:text-cyan-200">
                      {language === 'hi'
                        ? 'तैयार Android Studio प्रोजेक्ट फाइल्स (Native Kotlin + Advanced WebView)'
                        : 'Ready-to-use Android Studio Project Files (Kotlin + Advanced WebView)'}
                    </h3>
                    <p className="text-xs text-cyan-700 dark:text-cyan-300/80 mt-0.5">
                      {language === 'hi'
                        ? 'इसमें कैमरा/फाइल अपलोड (रिज्यूमे के लिए), पुल-टू-रिफ्रेश, बैक बटन नेविगेशन और ऑफलाइन एरर हैंडलिंग पहले से शामिल है।'
                        : 'Includes file upload (resumes), camera support, pull-to-refresh, hardware back button routing & offline handling.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[11px] font-mono text-cyan-800 dark:text-cyan-300 bg-white/70 dark:bg-slate-900/80 px-2 py-1 rounded border border-cyan-300 dark:border-cyan-700">
                    Package: com.ukpolytechnic.portal
                  </span>
                </div>
              </div>

              {/* Code Files Sub-tabs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                    <button
                      onClick={() => setSelectedCodeFile('kotlin')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCodeFile === 'kotlin'
                          ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>MainActivity.kt (Kotlin)</span>
                    </button>
                    <button
                      onClick={() => setSelectedCodeFile('manifest')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCodeFile === 'manifest'
                          ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>AndroidManifest.xml</span>
                    </button>
                    <button
                      onClick={() => setSelectedCodeFile('layout')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCodeFile === 'layout'
                          ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>activity_main.xml</span>
                    </button>
                    <button
                      onClick={() => setSelectedCodeFile('gradle')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCodeFile === 'gradle'
                          ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>build.gradle.kts</span>
                    </button>
                    <button
                      onClick={() => setSelectedCodeFile('network')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCodeFile === 'network'
                          ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>network_security_config.xml</span>
                    </button>
                    <button
                      onClick={() => setSelectedCodeFile('java')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        selectedCodeFile === 'java'
                          ? 'bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>MainActivity.java (Alternative)</span>
                    </button>
                  </div>
                </div>

                {/* Code Display Area */}
                <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <span className="text-slate-400 font-mono pl-2">
                        {selectedCodeFile === 'kotlin' && 'app/src/main/java/com/ukpolytechnic/portal/MainActivity.kt'}
                        {selectedCodeFile === 'manifest' && 'app/src/main/AndroidManifest.xml'}
                        {selectedCodeFile === 'layout' && 'app/src/main/res/layout/activity_main.xml'}
                        {selectedCodeFile === 'gradle' && 'app/build.gradle.kts'}
                        {selectedCodeFile === 'network' && 'app/src/main/res/xml/network_security_config.xml'}
                        {selectedCodeFile === 'java' && 'app/src/main/java/com/ukpolytechnic/portal/MainActivity.java'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const code =
                          selectedCodeFile === 'kotlin'
                            ? kotlinMainActivityCode
                            : selectedCodeFile === 'manifest'
                            ? manifestXmlCode
                            : selectedCodeFile === 'layout'
                            ? activityMainLayoutCode
                            : selectedCodeFile === 'gradle'
                            ? buildGradleCode
                            : selectedCodeFile === 'network'
                            ? networkSecurityConfigCode
                            : javaMainActivityCode;
                        handleCopy(code, selectedCodeFile);
                      }}
                      className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    >
                      {copiedKey === selectedCodeFile ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-4 text-xs font-mono text-cyan-100 overflow-x-auto max-h-[380px] leading-relaxed selection:bg-cyan-700 selection:text-white">
                    {selectedCodeFile === 'kotlin' && kotlinMainActivityCode}
                    {selectedCodeFile === 'manifest' && manifestXmlCode}
                    {selectedCodeFile === 'layout' && activityMainLayoutCode}
                    {selectedCodeFile === 'gradle' && buildGradleCode}
                    {selectedCodeFile === 'network' && networkSecurityConfigCode}
                    {selectedCodeFile === 'java' && javaMainActivityCode}
                  </pre>
                </div>
              </div>

              {/* Quick tip on IP address */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-bold">
                    {language === 'hi' ? 'महत्वपूर्ण IP एड्रेस गाइड: ' : 'Important IP Address Note: '}
                  </span>
                  <span>
                    {language === 'hi'
                      ? 'अगर आप Android Studio के Emulator में टेस्ट कर रहे हैं तो PORTAL_URL में "http://10.0.2.2:4000" या लाइव क्लाउड URL डालें। असली Android फोन में टेस्ट कर रहे हैं तो अपने लैपटॉप का Wi-Fi IP (जैसे "http://192.168.1.15:3000") या लाइव क्लाउड URL डालें।'
                      : 'If running in Android Studio Emulator, use "http://10.0.2.2:4000" or your live URL. If testing on a real phone via USB/Wi-Fi, use your PC local Wi-Fi IP or the live cloud URL.'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP HINDI + ENGLISH GUIDE */}
          {activeTab === 'step_by_step' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-900 text-white">
                <h3 className="text-base font-black flex items-center gap-2">
                  <Play className="w-5 h-5 text-amber-400 fill-amber-400" />
                  {language === 'hi'
                    ? 'Android Studio में ऐप चलाने की पूरी प्रक्रिया (Step-by-Step)'
                    : 'Complete Step-by-Step Guide to Run App in Android Studio'}
                </h3>
                <p className="text-xs text-indigo-200 mt-1">
                  {language === 'hi'
                    ? 'नीचे दिए गए 8 आसान स्टेप्स को फॉलो करें और 5 मिनट में अपनी APK फाइल बना लें:'
                    : 'Follow these 8 straightforward steps to run the app and generate your Android APK:'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-xs mb-1">
                      <span className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 flex items-center justify-center font-bold">1</span>
                      <span>{language === 'hi' ? 'Android Studio इंस्टॉल करें' : 'Install Android Studio'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {language === 'hi'
                        ? 'अगर आपके पास Android Studio नहीं है तो developer.android.com से फ्री में डाउनलोड करें (Ladybug / Koala / Iguana)।'
                        : 'Download and install Android Studio from developer.android.com with Android SDK (API 34).'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block text-[11px] font-mono px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      JDK 17 or JDK 21
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-xs mb-1">
                      <span className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 flex items-center justify-center font-bold">2</span>
                      <span>{language === 'hi' ? 'New Project बनाएं' : 'Create New Project'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {language === 'hi'
                        ? 'Android Studio खोलें > "New Project" > "Empty Views Activity" चुनें। Name: "UGIP Tanakpur", Package: "com.ukpolytechnic.portal", Language: "Kotlin" रखें।'
                        : 'Open Android Studio > New Project > select "Empty Views Activity". Set Name to "UGIP Tanakpur" and Language to Kotlin.'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block text-[11px] font-mono px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      Empty Views Activity
                    </span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-xs mb-1">
                      <span className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 flex items-center justify-center font-bold">3</span>
                      <span>{language === 'hi' ? 'Permissions व Manifest पेस्ट करें' : 'Paste AndroidManifest.xml'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {language === 'hi'
                        ? 'Tab 1 से `AndroidManifest.xml` कोड कॉपी करके अपने प्रोजेक्ट के `app/src/main/AndroidManifest.xml` में पेस्ट कर दें। इससे इंटरनेट और कैमरा परमिशन मिल जाएगी।'
                        : 'Copy AndroidManifest.xml from Tab 1 and paste into app/src/main/AndroidManifest.xml to grant Internet & Camera permissions.'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block text-[11px] font-mono px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      INTERNET & CAMERA Perms
                    </span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-xs mb-1">
                      <span className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 flex items-center justify-center font-bold">4</span>
                      <span>{language === 'hi' ? 'UI Layout XML पेस्ट करें' : 'Paste activity_main.xml'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {language === 'hi'
                        ? 'प्रोजेक्ट के `app/src/main/res/layout/activity_main.xml` को खोलें और Tab 1 का XML कोड पेस्ट करें (SwipeRefreshLayout + WebView + ProgressBar)।'
                        : 'Open app/src/main/res/layout/activity_main.xml and paste our XML layout with SwipeRefresh and WebView.'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block text-[11px] font-mono px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      SwipeRefreshLayout + WebView
                    </span>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-xs mb-1">
                      <span className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 flex items-center justify-center font-bold">5</span>
                      <span>{language === 'hi' ? 'MainActivity.kt कोड पेस्ट करें' : 'Paste MainActivity.kt'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {language === 'hi'
                        ? '`MainActivity.kt` खोलें और Tab 1 का कोड पेस्ट करें। PORTAL_URL में पहले से आपका लाइव पोर्टल लिंक लगा हुआ है।'
                        : 'Open MainActivity.kt and paste the complete Kotlin code. The PORTAL_URL is already pre-configured to your app.'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block text-[11px] font-mono px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      Kotlin WebChromeClient
                    </span>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-xs mb-1">
                      <span className="w-6 h-6 rounded-lg bg-cyan-100 dark:bg-cyan-900/60 flex items-center justify-center font-bold">6</span>
                      <span>{language === 'hi' ? 'build.gradle.kts में Dependency जोड़ें' : 'Add SwipeRefresh Dependency'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {language === 'hi'
                        ? '`app/build.gradle.kts` में `androidx.swiperefreshlayout:swiperefreshlayout:1.1.0` जोड़ें और ऊपर आए "Sync Now" बटन पर क्लिक करें।'
                        : 'Add swiperefreshlayout and webkit dependencies in build.gradle.kts and click "Sync Now".'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block text-[11px] font-mono px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      Gradle Sync Now
                    </span>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs mb-1">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center font-bold">7</span>
                      <span>{language === 'hi' ? 'फोन या Emulator कनेक्ट करें' : 'Connect Phone or Emulator'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {language === 'hi'
                        ? 'अपने Android फोन की Settings में जाएं > "About Phone" > "Build Number" पर 7 बार टैप करें (Developer options ऑन होगा)। फिर "USB Debugging" ऑन करके केबल से PC से कनेक्ट करें।'
                        : 'Connect your real phone via USB with USB Debugging enabled, or launch an Android Virtual Device (AVD).'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block text-[11px] font-mono px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                      USB Debugging: ON
                    </span>
                  </div>
                </div>

                {/* Step 8 */}
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs mb-1">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center font-bold">8</span>
                      <span>{language === 'hi' ? 'Run करें व APK बनाएं!' : 'Run & Build APK!'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {language === 'hi'
                        ? 'Android Studio में ऊपर हरे रंग के Play (▶️) बटन पर क्लिक करें। ऐप फोन पर खुल जाएगी! शेयर करने के लिए "Build > Build Bundle(s) / APK(s) > Build APK(s)" पर क्लिक करें।'
                        : 'Click the green Run (▶️) button to launch on your device! To share, go to Build > Build Bundle(s) / APK(s) > Build APK(s).'}
                    </p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block text-[11px] font-mono px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                      Build &gt; Build APK(s)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT PWA APP */}
          {activeTab === 'pwa' && (
            <div className="space-y-6">
              {/* PWA Hero Card */}
              <div className="p-6 rounded-3xl bg-emerald-950 text-white border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 max-w-xl text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ZERO-DOWNLOAD INSTANT APP (PWA)</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {language === 'hi'
                      ? 'बिना प्ले स्टोर के सीधे फोन में ऐप इंस्टॉल करें'
                      : 'Install Directly to Your Phone Home Screen'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {language === 'hi'
                      ? 'यह वेब ऐप आधिकारिक PWA (Progressive Web App) मानकों के साथ सुसज्जित है। इसे किसी भी Android फोन या iPhone पर 1-क्लिक में बिना प्ले स्टोर के होम स्क्रीन पर नेटिव ऐप की तरह इंस्टॉल किया जा सकता है।'
                      : 'Full progressive web app with standalone display, status bar theming, offline service worker caching, and home-screen launch icon.'}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                    {isInstalled ? (
                      <div className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-2 shadow-lg">
                        <Check className="w-4 h-4" />
                        <span>{language === 'hi' ? 'ऐप पहले से इंस्टॉल है!' : 'App Already Installed on Device!'}</span>
                      </div>
                    ) : (
                      <button
                        onClick={handlePWAInstall}
                        className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
                      >
                        <Download className="w-5 h-5 text-slate-950" />
                        <span>{language === 'hi' ? 'अभी इंस्टॉल करें (Install App)' : 'Install App on Device'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(currentAppUrl, 'pwa-url')}
                      className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'pwa-url' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{language === 'hi' ? 'मोबाइल लिंक कॉपी करें' : 'Copy Mobile URL'}</span>
                    </button>
                  </div>
                </div>

                {/* Phone QR Code simulation */}
                <div className="p-4 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center shadow-2xl shrink-0 w-48 text-center">
                  <div className="w-36 h-36 rounded-xl bg-slate-900 flex flex-col items-center justify-center text-white p-3 relative overflow-hidden group">
                    <QrCode className="w-24 h-24 text-cyan-400" />
                    <span className="text-[10px] font-mono font-bold text-cyan-300 tracking-wider mt-1">
                      SCAN ON PHONE
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 mt-2">
                    {language === 'hi' ? 'फोन कैमरे से स्कैन करें' : 'Scan with Camera'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono truncate max-w-[150px]">
                    {currentAppUrl}
                  </span>
                </div>
              </div>

              {/* Step-by-step instructions for Android Chrome and iOS Safari */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-sm mb-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Android फोन (Chrome / Brave)</span>
                  </div>
                  <ol className="text-xs space-y-2 text-slate-600 dark:text-slate-300 list-decimal list-inside leading-relaxed">
                    <li>अपने फोन के Chrome ब्राउज़र में यह पोर्टल URL खोलें।</li>
                    <li>ऊपर दाईं ओर दिए गए तीन डॉट्स (⋮) मेनू पर टैप करें।</li>
                    <li>
                      <strong className="text-cyan-700 dark:text-cyan-300">&ldquo;Install app&rdquo;</strong> या{' '}
                      <strong className="text-cyan-700 dark:text-cyan-300">&ldquo;Add to Home screen&rdquo;</strong> पर क्लिक करें।
                    </li>
                    <li>ऐप आपके मोबाइल ऐप ड्रॉअर में बिना एड्रेस बार के फुल-स्क्रीन खुलेगी।</li>
                  </ol>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black text-sm mb-2">
                    <Smartphone className="w-4 h-4" />
                    <span>Apple iPhone (Safari Browser)</span>
                  </div>
                  <ol className="text-xs space-y-2 text-slate-600 dark:text-slate-300 list-decimal list-inside leading-relaxed">
                    <li>iPhone के Safari ब्राउज़र में यह पोर्टल URL खोलें।</li>
                    <li>नीचे दिए गए <strong className="text-purple-700 dark:text-purple-300">Share बटन (चौकोर तीर)</strong> पर टैप करें।</li>
                    <li>नीचे स्क्रॉल करके <strong className="text-purple-700 dark:text-purple-300">&ldquo;Add to Home Screen&rdquo;</strong> चुनें।</li>
                    <li>ऊपर &ldquo;Add&rdquo; पर क्लिक करें — UGIP Tanakpur का ऐप आइकन स्क्रीन पर आ जाएगा।</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CAPACITOR CLI QUICK EXPORT */}
          {activeTab === 'capacitor' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-white flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-purple-200">
                    {language === 'hi'
                      ? 'Capacitor CLI (Modern Cross-Platform Android Bridge)'
                      : 'Capacitor CLI (Alternative 1-Click Native Project Creation)'}
                  </h3>
                  <p className="text-xs text-purple-200/80 mt-1">
                    {language === 'hi'
                      ? 'अगर आप Android Studio प्रोजेक्ट खुद हाथ से नहीं बनाना चाहते, तो Capacitor कमांड्स चलाकर 1 मिनट में खुद-ब-खुद पूरा Android Studio प्रोजेक्ट जनरेट कर सकते हैं:'
                      : 'If you prefer automated tooling, Capacitor generates the entire Android Studio project automatically:'}
                  </p>
                </div>
              </div>

              {/* Terminal Commands */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                    <span># Step 1: Install Capacitor in your terminal</span>
                    <button
                      onClick={() => handleCopy('npm install @capacitor/core @capacitor/cli @capacitor/android', 'cap-1')}
                      className="text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'cap-1' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <code>npm install @capacitor/core @capacitor/cli @capacitor/android</code>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                    <span># Step 2: Initialize App Configuration</span>
                    <button
                      onClick={() => handleCopy('npx cap init "UGIP Tanakpur" "com.ukpolytechnic.portal" --web-dir out', 'cap-2')}
                      className="text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'cap-2' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <code>{'npx cap init "UGIP Tanakpur" "com.ukpolytechnic.portal" --web-dir out'}</code>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-200 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                    <span># Step 3: Add Android Platform & Open in Android Studio</span>
                    <button
                      onClick={() => handleCopy('npx cap add android && npx cap open android', 'cap-3')}
                      className="text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'cap-3' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <code>npx cap add android && npx cap open android</code>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/50 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white block">
                  {language === 'hi' ? 'यह कमांड क्या करता है?' : 'What does this command do?'}
                </span>
                <p>
                  {language === 'hi'
                    ? '`npx cap open android` चलाते ही आपके कंप्यूटर में इंस्टॉल Android Studio खुद खुल जाएगा और पूरा प्रोजेक्ट पहले से तैयार मिलेगा। आप सीधे हरी ▶️ बटन दबाकर ऐप चला सकते हैं।'
                    : 'Running `npx cap open android` directly launches Android Studio with the complete generated project ready to run with zero manual configuration.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: PHONE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-2">
              <div className="text-center max-w-md">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {language === 'hi' ? 'लाइव मोबाइल ऐप प्रीव्यू सिमुलेटर' : 'Live Mobile Phone Simulator'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {language === 'hi'
                    ? 'देखें कि उत्तराखंड राजकीय पॉलीटेक्निक संस्थान, टनकपुर पोर्टल स्मार्टफोन स्क्रीन (390×844) पर कैसा दिखता है'
                    : 'Inspect the responsive touch UI formatted inside a standard Android/iPhone screen'}
                </p>
              </div>

              {/* Simulated Phone Chassis */}
              <div className="w-[360px] h-[640px] rounded-[48px] bg-slate-900 p-3.5 shadow-2xl border-4 border-slate-700 relative flex flex-col overflow-hidden">
                {/* Phone Speaker & Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mr-2" />
                  <div className="w-10 h-1 rounded-full bg-slate-700" />
                </div>

                {/* Inner Screen */}
                <div className="w-full h-full bg-slate-950 rounded-[38px] overflow-hidden relative flex flex-col pt-5">
                  {/* Status Bar */}
                  <div className="px-6 py-1 flex items-center justify-between text-[10px] text-slate-300 font-mono bg-slate-900/60 z-10">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <Wifi className="w-3 h-3 text-cyan-400" />
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* App Screen Content Preview */}
                  <div className="flex-1 overflow-y-auto bg-slate-900 p-3 text-xs text-slate-200 space-y-3">
                    <div className="p-3 rounded-xl bg-cyan-900/60 border border-cyan-500/30">
                      <div className="text-[11px] font-bold text-cyan-300">UGIP Tanakpur Mobile</div>
                      <div className="text-[13px] font-black text-white mt-0.5">Civil & CSE Placement Portal</div>
                      <div className="text-[10px] text-cyan-200/80 mt-1">24 Active Recruiters • 260+ Questions</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                        <div className="text-cyan-400 font-bold">L&T Infra</div>
                        <div className="text-white font-extrabold text-xs">₹3.80 LPA</div>
                        <div className="text-slate-400">Civil Core</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                        <div className="text-cyan-400 font-bold">HCLTech</div>
                        <div className="text-white font-extrabold text-xs">₹4.20 LPA</div>
                        <div className="text-slate-400">CSE Core</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-[11px]">
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>Anurag Mourya (Topper)</span>
                        <span className="text-emerald-400 font-bold">88.4%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">UBTER Roll: 22040801004</div>
                    </div>

                    <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-center">
                      <div className="text-cyan-300 font-bold text-xs">Full Touch Navigation Active</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Bottom bar enabled on all smartphones</div>
                    </div>
                  </div>

                  {/* Simulated Mobile Bottom Nav */}
                  <div className="py-2 px-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-around text-[9px] text-slate-400">
                    <span className="text-cyan-400 font-bold">Home</span>
                    <span>Drives</span>
                    <span>Student</span>
                    <span>Doubts</span>
                  </div>

                  {/* Home Indicator Bar */}
                  <div className="py-1 bg-slate-900 flex justify-center">
                    <div className="w-24 h-1 bg-slate-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Shield className="w-4 h-4 text-cyan-500" />
            <span>
              {language === 'hi'
                ? 'उत्तराखंड राजकीय पॉलीटेक्निक संस्थान, टनकपुर (UBTER 090) — एंड्रॉइड 8.0 से एंड्रॉइड 15+ तक 100% अनुकूल'
                : 'UBTER 090 Mobile App Architecture • Compatible with Android 8.0 through Android 15+'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('step_by_step')}
              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'गाइड पढ़ें' : 'View Guide'}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-xs transition-colors cursor-pointer"
            >
              {language === 'hi' ? 'पूर्ण हुआ' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
