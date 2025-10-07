import { enhancedAgentCrew } from '@/agents/enhancedCrew';

/**
 * Test runner for the agent system
 * Validates that all agents work correctly with various test scenarios
 */

interface TestCase {
  name: string;
  userId: string;
  bodyShape: 'X' | 'V' | 'H' | 'O' | 'A';
  stylePreference: 'classic' | 'romantic' | 'minimalist' | 'casual' | 'boohoo' | 'sporty';
  occasion: string;
  mood: string;
  budget: number;
  expectedMinLooks: number;
}

const TEST_CASES: TestCase[] = [
  {
    name: 'Classic Work Look for Hourglass',
    userId: 'test-user-001',
    bodyShape: 'X',
    stylePreference: 'classic',
    occasion: 'work',
    mood: 'elegant',
    budget: 1000,
    expectedMinLooks: 3
  },
  {
    name: 'Casual Weekend for Pear Shape',
    userId: 'test-user-002',
    bodyShape: 'A',
    stylePreference: 'casual',
    occasion: 'weekend',
    mood: 'energized',
    budget: 800,
    expectedMinLooks: 3
  },
  {
    name: 'Romantic Evening for Rectangle',
    userId: 'test-user-003',
    bodyShape: 'H',
    stylePreference: 'romantic',
    occasion: 'evening',
    mood: 'romantic',
    budget: 1500,
    expectedMinLooks: 3
  },
  {
    name: 'Minimalist Casual for Oval',
    userId: 'test-user-004',
    bodyShape: 'O',
    stylePreference: 'minimalist',
    occasion: 'casual',
    mood: 'casual',
    budget: 600,
    expectedMinLooks: 3
  }
];

export async function testAgentSystem() {
  console.log('🧪 ========================================');
  console.log('🧪 Starting Comprehensive Agent System Test');
  console.log('🧪 ========================================\n');
  
  const results = {
    total: TEST_CASES.length,
    passed: 0,
    failed: 0,
    errors: [] as string[]
  };
  
  for (const testCase of TEST_CASES) {
    console.log(`\n📋 Running Test: ${testCase.name}`);
    console.log('   Input:', {
      bodyShape: testCase.bodyShape,
      style: testCase.stylePreference,
      occasion: testCase.occasion,
      mood: testCase.mood,
      budget: `${testCase.budget} ILS`
    });
    
    try {
      const startTime = performance.now();
      
      // Run the enhanced crew with learning
      const result = await enhancedAgentCrew.runWithLearning({
        userId: testCase.userId,
        forceRefresh: true,
        randomSeed: Date.now()
      });
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      if (result.success && result.data?.looks) {
        const looks = result.data.looks;
        const looksCount = looks.length;
        
        // Validate results
        const hasEnoughLooks = looksCount >= testCase.expectedMinLooks;
        const allHaveShoes = looks.every((look: any) => 
          look.items?.some((item: any) => item.type === 'shoes')
        );
        const allHaveImages = looks.every((look: any) => 
          look.items?.every((item: any) => item.image)
        );
        
        if (hasEnoughLooks && allHaveShoes && allHaveImages) {
          console.log(`   ✅ PASSED (${duration}ms)`);
          console.log(`      - Generated ${looksCount} looks`);
          console.log(`      - All looks have shoes: ${allHaveShoes}`);
          console.log(`      - All items have images: ${allHaveImages}`);
          console.log(`      - Learning enabled: true`);
          
          if (result.data.supervisorFeedback) {
            console.log(`      - Supervisor feedback: ${result.data.supervisorFeedback.length} items`);
          }
          
          results.passed++;
        } else {
          console.log(`   ❌ FAILED (${duration}ms)`);
          console.log(`      - Generated ${looksCount} looks (expected >= ${testCase.expectedMinLooks})`);
          console.log(`      - All looks have shoes: ${allHaveShoes}`);
          console.log(`      - All items have images: ${allHaveImages}`);
          results.failed++;
          results.errors.push(`${testCase.name}: Validation failed`);
        }
      } else {
        console.log(`   ❌ FAILED (${duration}ms)`);
        console.log(`      - Error: ${result.error || 'No looks generated'}`);
        results.failed++;
        results.errors.push(`${testCase.name}: ${result.error || 'No looks generated'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR`);
      console.log(`      - ${error instanceof Error ? error.message : 'Unknown error'}`);
      results.failed++;
      results.errors.push(`${testCase.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Print summary
  console.log('\n🎯 ========================================');
  console.log('🎯 Test Summary');
  console.log('🎯 ========================================');
  console.log(`   Total Tests: ${results.total}`);
  console.log(`   Passed: ${results.passed} ✅`);
  console.log(`   Failed: ${results.failed} ❌`);
  console.log(`   Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  console.log('\n');
  
  return results;
}

// Export individual test function for manual testing
export async function testSingleCase(testCase: TestCase) {
  console.log(`🧪 Testing: ${testCase.name}`);
  
  try {
    const result = await enhancedAgentCrew.runWithLearning({
      userId: testCase.userId,
      forceRefresh: true,
      randomSeed: Date.now()
    });
    
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Test error:', error);
    throw error;
  }
}

// Make it runnable from browser console
if (typeof window !== 'undefined') {
  (window as any).testAgents = testAgentSystem;
  (window as any).testAgentCase = testSingleCase;
  console.log('💡 Agent tests available: window.testAgents() or window.testAgentCase(testCase)');
}
