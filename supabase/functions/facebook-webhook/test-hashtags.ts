// Test script for hashtag functionality
import { generateSmartHashtags, generateContextHashtags } from './hashtag-generator.ts';

// Test cases for hashtag generation
console.log('🧪 Testing hashtag generation...');

// Test 1: Price inquiry
const testMessage1 = 'كم سعر هذا المنتج؟';
const hashtags1 = generateSmartHashtags(testMessage1, 'comment');
console.log('Test 1 - Price inquiry:', hashtags1);

// Test 2: Thank you message
const testMessage2 = 'شكراً لكم على الخدمة الممتازة';
const hashtags2 = generateSmartHashtags(testMessage2, 'comment');
console.log('Test 2 - Thank you:', hashtags2);

// Test 3: Image question
const testMessage3 = 'ما هو لون الصورة؟';
const hashtags3 = generateSmartHashtags(testMessage3, 'comment');
console.log('Test 3 - Image question:', hashtags3);

// Test 4: Context hashtags
const postContent = 'عرض خاص - تخفيض على جميع المنتجات الجديدة';
const contextHashtags = generateContextHashtags(postContent);
console.log('Test 4 - Context hashtags:', contextHashtags);

console.log('✅ Hashtag testing completed');