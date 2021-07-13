// var maximumProduct = function(nums) {
//   nums.sort((a, b) => a - b);
//   console.log(nums);
//   const n = nums.length;
//   return Math.max(nums[0]*nums[1]*nums[2],nums[0]*nums[1]*nums[n-1],nums[n-1]*nums[n-2]*nums[n-3]);
// };

// maximumProduct([1,2,3])


var findErrorNums = function (nums) {
  let n = nums.length;
  let sum = (n + 1) * n / 2;
  let double = 0;
  for (let i = 0; i < n; i++) {
    let j = Math.abs(nums[i]);
    if (nums[j - 1] < 0) {
      double = j;
    } else {
      nums[j - 1] *= -1;
    }
    sum -= j;
  }
  return [double, sum + double]
} 

findErrorNums([1, 2, 2, 4])