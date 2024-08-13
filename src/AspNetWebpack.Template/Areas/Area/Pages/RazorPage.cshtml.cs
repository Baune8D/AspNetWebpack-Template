using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace AspNetWebpack.Template.Areas.Area.Pages
{
    public class RazorPageModel : PageModel
    {
        public IActionResult OnGet()
        {
            return Page();
        }
    }
}
