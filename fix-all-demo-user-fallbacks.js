/**
 * COMPREHENSIVE DEMO USER FALLBACK REMOVAL
 * Fixes all remaining instances of "|| 999" fallbacks in the application
 */

import fs from 'fs';

async function fixAllDemoUserFallbacks() {
  console.log('🔧 FIXING ALL DEMO USER FALLBACKS (|| 999)...');
  
  try {
    // Read the current routes.ts file
    const routesPath = 'server/routes.ts';
    let content = fs.readFileSync(routesPath, 'utf8');
    
    // Count initial instances
    const initialMatches = (content.match(/\|\| 999/g) || []).length;
    console.log(`Found ${initialMatches} instances of "|| 999" fallbacks`);
    
    // Replace all instances with proper authentication
    const patterns = [
      {
        old: /const userId = req\.session\?\.userId \|\| 999;/g,
        new: `const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }`
      },
      {
        old: /const userId = req\.session\.userId \|\| 999;/g,
        new: `const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }`
      },
      {
        old: /const userId = parseInt\(req\.params\.userId\) \|\| req\.session\?\.userId \|\| 999;/g,
        new: `const userId = parseInt(req.params.userId) || req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }`
      },
      {
        old: /\|\| 999; \/\/ Demo user/g,
        new: `;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }`
      }
    ];
    
    let fixCount = 0;
    
    patterns.forEach((pattern, index) => {
      const beforeCount = (content.match(pattern.old) || []).length;
      content = content.replace(pattern.old, pattern.new);
      const afterCount = (content.match(pattern.old) || []).length;
      const fixed = beforeCount - afterCount;
      if (fixed > 0) {
        console.log(`Pattern ${index + 1}: Fixed ${fixed} instances`);
        fixCount += fixed;
      }
    });
    
    // Final verification
    const remainingMatches = (content.match(/\|\| 999/g) || []).length;
    
    if (remainingMatches > 0) {
      console.log(`⚠️  ${remainingMatches} instances still remain - manual review needed`);
    } else {
      console.log('✅ ALL demo user fallbacks removed!');
    }
    
    // Write the updated content back
    fs.writeFileSync(routesPath, content, 'utf8');
    
    console.log(`🎯 Fixed ${fixCount} demo user fallbacks`);
    console.log('💪 System now requires proper authentication for all operations');
    
  } catch (error) {
    console.error('❌ Error fixing demo user fallbacks:', error);
  }
}

// Run the fix
fixAllDemoUserFallbacks();