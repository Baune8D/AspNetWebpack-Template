using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AspNetCoreWebpack.Pages
{
    public class RazorPageModel : PageModel
    {
        public IActionResult OnGet()
        {
            return Page();
        }
    }
}
