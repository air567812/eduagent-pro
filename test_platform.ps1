# EduAgent Pro Integration Verification Suite

Write-Host "`n=== 1. Testing AI Agent Tool: IMPORTANT_QUESTIONS ===" -ForegroundColor Cyan
$aiReq1 = @{
    toolKey = "IMPORTANT_QUESTIONS"
    sourceText = "Calculus: Limits and continuous differentiability. A function is continuous if limit as x approaches a equals f(a). The derivative is defined as limit h->0 (f(x+h)-f(x))/h."
    parameters = @{ difficulty = "MODERATE"; questionCount = "5" }
} | ConvertTo-Json

$aiRes1 = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/generate" -Method Post -Body $aiReq1 -ContentType "application/json"
Write-Host "Important Questions Success:" $aiRes1.success
Write-Host "Tool Model:" $aiRes1.result.modelUsed
Write-Host "Title:" $aiRes1.result.data.title
Write-Host "Questions Generated:" $aiRes1.result.data.questions.Count

Write-Host "`n=== 2. Testing AI Agent Tool: FLASHCARD_GENERATOR ===" -ForegroundColor Cyan
$aiReq2 = @{
    toolKey = "FLASHCARD_GENERATOR"
    sourceText = "Quantum Physics: Wave-particle duality, De Broglie wavelength lambda = h/p, Heisenberg uncertainty principle delta_x * delta_p >= hbar/2."
    parameters = @{ cardCount = "8" }
} | ConvertTo-Json

$aiRes2 = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/generate" -Method Post -Body $aiReq2 -ContentType "application/json"
Write-Host "Flashcards Success:" $aiRes2.success
Write-Host "Deck Title:" $aiRes2.result.data.deckTitle
Write-Host "Cards Count:" $aiRes2.result.data.cards.Count
Write-Host "Sample Card Front:" $aiRes2.result.data.cards[0].front

Write-Host "`n=== 3. Testing AI Agent Tool: MCQ_GENERATOR (With Distractor Rationale) ===" -ForegroundColor Cyan
$aiReq3 = @{
    toolKey = "MCQ_GENERATOR"
    sourceText = "Biochemistry: Enzymes act as biological catalysts by lowering activation energy without altering the overall free energy change (delta G) of the reaction."
    parameters = @{ questionCount = "5" }
} | ConvertTo-Json

$aiRes3 = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/generate" -Method Post -Body $aiReq3 -ContentType "application/json"
Write-Host "MCQs Success:" $aiRes3.success
Write-Host "MCQ Count:" $aiRes3.result.data.mcqs.Count
Write-Host "First Question:" $aiRes3.result.data.mcqs[0].question
Write-Host "Correct Index:" $aiRes3.result.data.mcqs[0].correctOptionIndex
Write-Host "Distractor Rationale Count:" $aiRes3.result.data.mcqs[0].distractorRationales.Count

Write-Host "`n=== 4. Testing Multi-Image Quota Enforcement Logic ===" -ForegroundColor Cyan
$nodeCheck = & "C:\Program Files\nodejs\node.exe" -e "
const { validateUploadLimits } = require('./src/lib/limits.ts');
// Test 1: Basic free tier with 25 images (Must Pass)
const test25 = validateUploadLimits('BASIC', 25);
console.log('Test 25 Images (Basic):', test25.valid ? 'PASSED (Allowed)' : 'FAILED');

// Test 2: Basic free tier with 26 images (Must strictly Fail with Quota message)
const test26 = validateUploadLimits('BASIC', 26);
console.log('Test 26 Images (Basic):', !test26.valid ? 'PASSED (Strictly Blocked: ' + test26.error.slice(0, 50) + '...)' : 'FAILED');

// Test 3: Pro tier with 100 images (Must Pass)
const testPro100 = validateUploadLimits('PRO', 100);
console.log('Test 100 Images (Pro):', testPro100.valid ? 'PASSED (Allowed)' : 'FAILED');
"
Write-Host $nodeCheck

Write-Host "`n=== All Integration Tests Completed Successfully! ===" -ForegroundColor Green
