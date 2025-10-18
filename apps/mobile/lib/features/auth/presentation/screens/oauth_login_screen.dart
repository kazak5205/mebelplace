import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../../core/widgets/glass/glass_panel.dart';
import '../../../../core/widgets/glass/glass_button.dart';
import '../../../../core/theme/liquid_glass_colors.dart';
import '../../../../core/theme/liquid_glass_text_styles.dart';
import '../../../../core/config/api_config.dart';

class OAuthLoginScreen extends ConsumerStatefulWidget {
  const OAuthLoginScreen({super.key});

  @override
  ConsumerState<OAuthLoginScreen> createState() => _OAuthLoginScreenState();
}

class _OAuthLoginScreenState extends ConsumerState<OAuthLoginScreen> {
  final _storage = const FlutterSecureStorage();
  bool _isLoading = false;

  Future<void> _signInWithGoogle() async {
    setState(() => _isLoading = true);

    try {
      final GoogleSignIn googleSignIn = GoogleSignIn(
        scopes: ['email', 'profile'],
      );

      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      
      if (googleUser == null) {
        setState(() => _isLoading = false);
        return;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      
      // Send to backend
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/auth/oauth/google'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'id_token': googleAuth.idToken,
          'access_token': googleAuth.accessToken,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await _storage.write(key: 'auth_token', value: data['token']);
        
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/main');
        }
      } else {
        throw Exception('Google OAuth failed');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка Google Sign In: $e'),
            backgroundColor: LiquidGlassColors.errorRed,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _signInWithApple() async {
    setState(() => _isLoading = true);

    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
      );

      // Send to backend
      final response = await http.post(
        Uri.parse('${ApiConfig.baseUrl}/api/v2/auth/oauth/apple'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'id_token': credential.identityToken,
          'authorization_code': credential.authorizationCode,
          'user_identifier': credential.userIdentifier,
        }),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await _storage.write(key: 'auth_token', value: data['token']);
        
        if (mounted) {
          Navigator.pushReplacementNamed(context, '/main');
        }
      } else {
        throw Exception('Apple Sign In failed');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка Apple Sign In: $e'),
            backgroundColor: LiquidGlassColors.errorRed,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? Colors.black : Colors.white,
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            Icon(
              Icons.emoji_emotions,
              size: 100,
              color: LiquidGlassColors.primaryOrange,
            ),
            const SizedBox(height: 24),
            Text(
              'MebelPlace',
              style: LiquidGlassTextStyles.h1Light(context),
            ),
            const SizedBox(height: 48),
            
            GlassPanel(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Text(
                    'Войти через',
                    style: LiquidGlassTextStyles.h3Light(isDark),
                  ),
                  const SizedBox(height: 24),
                  
                  // Google Sign In
                  _buildOAuthButton(
                    label: 'Google',
                    icon: Icons.g_mobiledata,
                    color: const Color(0xFF4285F4),
                    onTap: _signInWithGoogle,
                    isLoading: _isLoading,
                  ),
                  const SizedBox(height: 16),
                  
                  // Apple Sign In
                  _buildOAuthButton(
                    label: 'Apple',
                    icon: Icons.apple,
                    color: isDark ? Colors.white : Colors.black,
                    onTap: _signInWithApple,
                    isLoading: _isLoading,
                  ),
                  const SizedBox(height: 32),
                  
                  // Email/Password login
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/login'),
                    child: Text(
                      'Войти с email и паролем',
                      style: TextStyle(color: LiquidGlassColors.primaryOrange),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOAuthButton({
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
    required bool isLoading,
  }) {
    return SizedBox(
      width: double.infinity,
      child: GlassButton.secondary(
        label,
        icon: Icon(icon, color: color),
        onTap: onTap,
        isLoading: isLoading,
      ),
    );
  }
}


