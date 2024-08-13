using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AspNetWebpack.Template.Pages
{
    public class RazorPageModel : PageModel
    {
        public IActionResult OnGet()
        {
            return Page();
        }
    }
}
